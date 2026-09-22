import mongoose from 'mongoose';
import projectModel from "../models/project.model.js";
import userModel from '../models/user.model.js';
import {
    sendProjectInvite,
    sendProjectInviteSignup
} from './email.service.js';


const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id);


// ============================================================
// CREATE PROJECT
// ============================================================

export const createProject = async ({ name, userId }) => {

    if (!name) {
        throw new Error('Name is required');
    }

    if (!userId) {
        throw new Error('User is required');
    }

    if (!isValidObjectId(userId)) {
        throw new Error(
            'User ID must be a valid MongoDB ObjectId'
        );
    }

    try {

        const project = await projectModel.create({
            name,
            users: [userId],
            isDemo: false
        });

        return project;

    } catch (err) {

        if (err?.code === 11000) {
            throw new Error(
                'Project name already exists'
            );
        }

        throw err;
    }
};


// ============================================================
// GET ALL PROJECTS
// ============================================================

export const getAllProjectByUserId = async ({
    userId,
    isDemo = false
}) => {

    if (!userId) {
        throw new Error('UserId is required');
    }

    if (!isValidObjectId(userId)) {
        throw new Error(
            'User ID must be a valid MongoDB ObjectId'
        );
    }


    // ========================================================
    // DEMO USER
    // ========================================================

    if (isDemo === true) {

        // Check whether demo project already exists
        let demoProject = await projectModel.findOne({
            isDemo: true
        });


        // ====================================================
        // CREATE DEMO PROJECT AUTOMATICALLY
        // ====================================================

        if (!demoProject) {

            demoProject = await projectModel.create({

                name: 'CodeForge AI Demo',

                // Demo user is the only user attached
                // to the demo project.
                users: [userId],

                isDemo: true,

                fileTree: {
                    'README.md': {
                        file: {
                            contents:
                                '# CodeForge AI Demo\n\n' +
                                'Welcome to CodeForge AI!\n\n' +
                                'This is the public demo project. Explore the project and try the AI coding environment.'
                        }
                    },

                    'package.json': {
                        file: {
                            contents: JSON.stringify(
                                {
                                    name: 'codeforge-demo',
                                    version: '1.0.0',
                                    type: 'module',
                                    scripts: {
                                        start: 'node index.js'
                                    }
                                },
                                null,
                                2
                            )
                        }
                    },

                    'index.js': {
                        file: {
                            contents:
                                'console.log("Welcome to CodeForge AI!");'
                        }
                    }
                }
            });

        }


        return [
            {
                ...demoProject.toObject(),
                messages: undefined
            }
        ];
    }


    // ========================================================
    // NORMAL USER
    // ========================================================

    const allUserProjects =
        await projectModel.find({
            users: userId,
            isDemo: false
        }).select('-messages');


    return allUserProjects;
};


// ============================================================
// ADD USERS TO PROJECT
// ============================================================

export const addUsersToProject = async ({
    projectId,
    users,
    userId
}) => {

    if (!projectId) {
        throw new Error(
            "projectId is required"
        );
    }

    if (!isValidObjectId(projectId)) {
        throw new Error(
            'projectId must be a valid MongoDB ObjectId'
        );
    }

    if (!users) {
        throw new Error(
            "users are required"
        );
    }

    if (
        !Array.isArray(users) ||
        users.length === 0
    ) {
        throw new Error(
            'Users must be a non-empty array'
        );
    }

    if (!userId) {
        throw new Error(
            "userId is required"
        );
    }


    const invalidUsers =
        users.filter(
            user => !isValidObjectId(user)
        );


    if (invalidUsers.length > 0) {
        throw new Error(
            `Invalid user ID(s): ${invalidUsers.join(', ')}`
        );
    }


    const project =
        await projectModel.findOne({
            _id: projectId,
            users: userId,
            isDemo: false
        });


    if (!project) {
        throw new Error(
            "User does not belong to this project"
        );
    }


    const updatedProject =
        await projectModel.findByIdAndUpdate(

            projectId,

            {
                $addToSet: {
                    users: {
                        $each: users
                    }
                }
            },

            {
                new: true
            }
        );


    if (!updatedProject) {
        throw new Error(
            'Project not found'
        );
    }


    return updatedProject;
};


// ============================================================
// GET PROJECT BY ID
// ============================================================

export const getProjectById = async ({
    projectId,
    userId,
    isDemo = false
}) => {

    if (!projectId) {
        throw new Error(
            "projectId is required"
        );
    }

    if (!isValidObjectId(projectId)) {
        throw new Error(
            "Invalid projectId"
        );
    }

    if (!userId) {
        throw new Error(
            "userId is required"
        );
    }

    if (!isValidObjectId(userId)) {
        throw new Error(
            "Invalid userId"
        );
    }


    // ========================================================
    // DEMO USER
    // ========================================================

    if (isDemo === true) {

        return await projectModel.findOne({
            _id: projectId,
            isDemo: true
        }).populate('users');
    }


    // ========================================================
    // NORMAL USER
    // ========================================================

    return await projectModel.findOne({
        _id: projectId,
        users: userId,
        isDemo: false
    }).populate('users');
};


// ============================================================
// UPDATE FILE TREE
// ============================================================

export const updateFileTree = async ({
    projectId,
    fileTree,
    userId
}) => {

    if (!projectId) {
        throw new Error(
            "projectId is required"
        );
    }

    if (!isValidObjectId(projectId)) {
        throw new Error(
            "Invalid projectId"
        );
    }

    if (!userId) {
        throw new Error(
            "userId is required"
        );
    }

    if (!isValidObjectId(userId)) {
        throw new Error(
            "Invalid userId"
        );
    }

    if (!fileTree) {
        throw new Error(
            "fileTree is required"
        );
    }


    const project =
        await projectModel.findOneAndUpdate(

            {
                _id: projectId,
                users: userId,
                isDemo: false
            },

            {
                fileTree
            },

            {
                new: true
            }
        );


    if (!project) {
        throw new Error(
            "Project not found or access denied"
        );
    }


    return project;
};


// ============================================================
// INVITE USERS
// ============================================================

export const inviteUsersToProject = async ({
    projectId,
    targetUserIds,
    inviter
}) => {

    if (!projectId) {
        throw new Error(
            "projectId is required"
        );
    }

    if (!isValidObjectId(projectId)) {
        throw new Error(
            'projectId must be a valid MongoDB ObjectId'
        );
    }

    if (
        !Array.isArray(targetUserIds) ||
        targetUserIds.length === 0
    ) {
        throw new Error(
            'userIds must be a non-empty array'
        );
    }


    const invalidUsers =
        targetUserIds.filter(
            id => !isValidObjectId(id)
        );


    if (invalidUsers.length > 0) {
        throw new Error(
            `Invalid user ID(s): ${invalidUsers.join(', ')}`
        );
    }


    const project =
        await projectModel.findOne({
            _id: projectId,
            users: inviter._id,
            isDemo: false
        });


    if (!project) {
        throw new Error(
            "User does not belong to this project"
        );
    }


    const invited = [];
    const skipped = [];


    for (const targetId of targetUserIds) {

        const idStr = targetId.toString();


        if (
            project.users.some(
                u => u.toString() === idStr
            )
        ) {

            skipped.push({
                userId: targetId,
                reason: 'Already a collaborator'
            });

            continue;
        }


        const alreadyInvited =
            project.pendingInvites.some(
                inv =>
                    inv.user.toString() === idStr &&
                    inv.status === 'pending'
            );


        if (alreadyInvited) {

            skipped.push({
                userId: targetId,
                reason: 'Invite already pending'
            });

            continue;
        }


        project.pendingInvites.push({

            user: targetId,

            invitedBy: {
                _id: inviter._id,
                name: inviter.name,
                email: inviter.email
            },

            status: 'pending'
        });


        invited.push(targetId);
    }


    await project.save();


    if (invited.length > 0) {

        const invitedUsers =
            await userModel.find({
                _id: {
                    $in: invited
                }
            }).select('email');


        for (const u of invitedUsers) {

            sendProjectInvite(
                u.email,
                {
                    projectName: project.name,
                    inviterName: inviter.name
                }
            ).catch(
                e =>
                    console.error(
                        'Invite email error:',
                        e
                    )
            );
        }
    }


    return {
        project,
        invited,
        skipped
    };
};


// ============================================================
// GET PENDING INVITES
// ============================================================

export const getMyPendingInvites = async ({
    userId
}) => {

    if (!userId) {
        throw new Error(
            "userId is required"
        );
    }

    if (!isValidObjectId(userId)) {
        throw new Error(
            'userId must be a valid MongoDB ObjectId'
        );
    }


    const projects =
        await projectModel.find({
            'pendingInvites.user': userId,
            'pendingInvites.status': 'pending'
        }).select(
            'name pendingInvites'
        );


    const invites = [];


    projects.forEach(
        proj => {

            proj.pendingInvites.forEach(
                inv => {

                    if (
                        inv.user.toString() ===
                        userId.toString() &&
                        inv.status === 'pending'
                    ) {

                        invites.push({
                            projectId: proj._id,
                            projectName: proj.name,
                            invitedBy: inv.invitedBy,
                            createdAt: inv.createdAt
                        });

                    }

                }
            );

        }
    );


    return invites;
};


// ============================================================
// RESPOND TO INVITE
// ============================================================

export const respondToInvite = async ({
    projectId,
    userId,
    action
}) => {

    if (!projectId) {
        throw new Error(
            "projectId is required"
        );
    }

    if (!isValidObjectId(projectId)) {
        throw new Error(
            'projectId must be a valid MongoDB ObjectId'
        );
    }

    if (!userId) {
        throw new Error(
            "userId is required"
        );
    }

    if (
        !['accept', 'reject'].includes(action)
    ) {
        throw new Error(
            "action must be 'accept' or 'reject'"
        );
    }


    const project =
        await projectModel.findById(
            projectId
        );


    if (!project) {
        throw new Error(
            "Project not found"
        );
    }


    if (project.isDemo) {
        throw new Error(
            "Demo project is read-only"
        );
    }


    const invite =
        project.pendingInvites.find(
            inv =>
                inv.user.toString() ===
                userId.toString() &&
                inv.status === 'pending'
        );


    if (!invite) {
        throw new Error(
            "No pending invite found"
        );
    }


    if (action === 'accept') {

        if (
            !project.users.some(
                u =>
                    u.toString() ===
                    userId.toString()
            )
        ) {

            project.users.push(userId);
        }
    }


    project.pendingInvites =
        project.pendingInvites.filter(
            inv =>
                !(
                    inv.user.toString() ===
                    userId.toString() &&
                    inv.status === 'pending'
                )
        );


    await project.save();


    return project;
};


// ============================================================
// LEAVE PROJECT
// ============================================================

export const leaveProject = async ({
    projectId,
    userId
}) => {

    if (!projectId) {
        throw new Error(
            "projectId is required"
        );
    }

    if (!isValidObjectId(projectId)) {
        throw new Error(
            'projectId must be a valid MongoDB ObjectId'
        );
    }

    if (!userId) {
        throw new Error(
            "userId is required"
        );
    }


    const project =
        await projectModel.findOne({
            _id: projectId,
            users: userId,
            isDemo: false
        });


    if (!project) {
        throw new Error(
            "You are not a member of this project"
        );
    }


    project.users =
        project.users.filter(
            u =>
                u.toString() !==
                userId.toString()
        );


    await project.save();


    return project;
};


// ============================================================
// INVITE BY EMAIL
// ============================================================

export const inviteByEmail = async ({
    projectId,
    email,
    inviter
}) => {

    if (!projectId) {
        throw new Error(
            "projectId is required"
        );
    }

    if (!isValidObjectId(projectId)) {
        throw new Error(
            'projectId must be a valid MongoDB ObjectId'
        );
    }

    if (
        !email ||
        !/^\S+@\S+\.\S+$/.test(email)
    ) {
        throw new Error(
            'Valid email is required'
        );
    }


    const normalizedEmail =
        email.trim().toLowerCase();


    const project =
        await projectModel.findOne({
            _id: projectId,
            users: inviter._id,
            isDemo: false
        });


    if (!project) {
        throw new Error(
            "User does not belong to this project"
        );
    }


    const existingUser =
        await userModel.findOne({
            email: normalizedEmail
        });


    if (existingUser) {

        if (
            existingUser._id.toString() ===
            inviter._id.toString()
        ) {

            throw new Error(
                "You can't invite yourself"
            );
        }


        return await inviteUsersToProject({
            projectId,
            targetUserIds: [
                existingUser._id.toString()
            ],
            inviter
        });
    }


    project.emailInvites =
        project.emailInvites || [];


    const alreadyInvited =
        project.emailInvites.some(
            inv =>
                inv.email === normalizedEmail &&
                inv.status === 'pending'
        );


    if (alreadyInvited) {

        return {
            skipped: true,
            reason:
                'Invite already sent to this email'
        };
    }


    project.emailInvites.push({

        email: normalizedEmail,

        invitedBy: {
            _id: inviter._id,
            name: inviter.name,
            email: inviter.email
        },

        status: 'pending'
    });


    await project.save();


    await sendProjectInviteSignup(
        normalizedEmail,
        {
            projectName: project.name,
            inviterName: inviter.name
        }
    );


    return {
        invited: true,
        email: normalizedEmail
    };
};


// ============================================================
// CONVERT EMAIL INVITES AFTER SIGNUP
// ============================================================

export const convertEmailInvitesToUserInvites = async ({
    email,
    userId
}) => {

    if (!email || !userId) {
        return;
    }


    const normalizedEmail =
        email.trim().toLowerCase();


    const projects =
        await projectModel.find({
            'emailInvites.email': normalizedEmail,
            'emailInvites.status': 'pending'
        });


    for (const project of projects) {

        let changed = false;


        for (const inv of project.emailInvites) {

            if (
                inv.email === normalizedEmail &&
                inv.status === 'pending'
            ) {

                inv.status = 'accepted';


                const alreadyMember =
                    project.users.some(
                        u =>
                            u.toString() ===
                            userId.toString()
                    );


                const alreadyPending =
                    project.pendingInvites.some(
                        p =>
                            p.user.toString() ===
                            userId.toString() &&
                            p.status === 'pending'
                    );


                if (
                    !alreadyMember &&
                    !alreadyPending
                ) {

                    project.pendingInvites.push({

                        user: userId,

                        invitedBy: inv.invitedBy,

                        status: 'pending'
                    });
                }


                changed = true;
            }
        }


        if (changed) {
            await project.save();
        }
    }
};