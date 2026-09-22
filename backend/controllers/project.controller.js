import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import { validationResult } from 'express-validator';
import Project from '../models/project.model.js';


// ============================================================
// DEMO USER CHECK
// ============================================================

const isDemoUser = (req) => {
    return req.user?.isDemo === true;
};


// ============================================================
// CREATE PROJECT
// ============================================================

export const createProject = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    // Demo account is read-only
    if (isDemoUser(req)) {
        return res.status(403).json({
            message: 'Demo account is read-only. You cannot create projects.'
        });
    }

    try {

        const { name } = req.body;
        const userId = req.user._id;

        const newProject = await projectService.createProject({
            name,
            userId
        });

        return res.status(201).json(newProject);

    } catch (err) {

        console.log(err);

        if (err.code === 11000) {
            return res.status(400).json({
                message: 'Project name already exists'
            });
        }

        return res.status(400).json({
            message: err.message
        });
    }
};


// ============================================================
// GET ALL PROJECTS
// ============================================================

export const getAllProject = async (req, res) => {

    try {

        const allUserProjects =
            await projectService.getAllProjectByUserId({
                userId: req.user._id,
                isDemo: isDemoUser(req)
            });

        return res.status(200).json({
            projects: allUserProjects
        });

    } catch (err) {

        console.log(err);

        return res.status(400).json({
            error: err.message
        });
    }
};


// ============================================================
// ADD USERS TO PROJECT
// ============================================================

export const addUserToProject = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    // Demo account is read-only
    if (isDemoUser(req)) {
        return res.status(403).json({
            message: 'Demo account is read-only.'
        });
    }

    try {

        const {
            projectId,
            users
        } = req.body;

        const updatedProject =
            await projectService.addUsersToProject({
                projectId,
                users,
                userId: req.user._id
            });

        return res.status(200).json(updatedProject);

    } catch (err) {

        console.log(err);

        return res.status(400).json({
            error: err.message
        });
    }
};


// ============================================================
// GET PROJECT BY ID
// ============================================================

export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {

        const project =
            await projectService.getProjectById({
                projectId,
                userId: req.user._id,
                isDemo: isDemoUser(req)
            });

        if (!project) {
            return res.status(404).json({
                message: 'Project not found or access denied'
            });
        }

        return res.status(200).json({
            project
        });

    } catch (err) {

        console.log(err);

        return res.status(400).json({
            error: err.message
        });
    }
};


// ============================================================
// UPDATE FILE TREE
// ============================================================

export const updateFileTree = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    // Demo account is read-only
    if (isDemoUser(req)) {
        return res.status(403).json({
            message: 'Demo account is read-only. You cannot modify files.'
        });
    }

    try {

        const {
            projectId,
            fileTree
        } = req.body;

        const project =
            await projectService.updateFileTree({
                projectId,
                fileTree,
                userId: req.user._id
            });

        return res.status(200).json({
            project
        });

    } catch (err) {

        console.log(err);

        return res.status(400).json({
            error: err.message
        });
    }
};


// ============================================================
// DELETE PROJECT
// ============================================================

export const deleteProject = async (req, res) => {

    // Demo account is read-only
    if (isDemoUser(req)) {
        return res.status(403).json({
            message: 'Demo account is read-only. You cannot delete projects.'
        });
    }

    try {

        const { projectId } = req.params;

        const project =
            await Project.findOneAndDelete({
                _id: projectId,
                users: req.user._id
            });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or access denied'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ============================================================
// INVITE USERS
// ============================================================

export const inviteUsers = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    // Demo account is read-only
    if (isDemoUser(req)) {
        return res.status(403).json({
            message: 'Demo account is read-only.'
        });
    }

    try {

        const {
            projectId,
            userIds
        } = req.body;

        const result =
            await projectService.inviteUsersToProject({
                projectId,
                targetUserIds: userIds,
                inviter: req.user
            });

        return res.status(200).json(result);

    } catch (err) {

        console.log(err);

        return res.status(400).json({
            error: err.message
        });
    }
};


// ============================================================
// GET PENDING INVITES
// ============================================================

export const getPendingInvites = async (req, res) => {

    try {

        const invites =
            await projectService.getMyPendingInvites({
                userId: req.user._id
            });

        return res.status(200).json({
            invites
        });

    } catch (err) {

        console.log(err);

        return res.status(400).json({
            error: err.message
        });
    }
};


// ============================================================
// RESPOND TO INVITE
// ============================================================

export const respondInvite = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    // Demo account is read-only
    if (isDemoUser(req)) {
        return res.status(403).json({
            message: 'Demo account is read-only.'
        });
    }

    try {

        const {
            projectId,
            action
        } = req.body;

        const project =
            await projectService.respondToInvite({
                projectId,
                userId: req.user._id,
                action
            });

        return res.status(200).json({
            project
        });

    } catch (err) {

        console.log(err);

        return res.status(400).json({
            error: err.message
        });
    }
};


// ============================================================
// LEAVE PROJECT
// ============================================================

export const leaveProjectController = async (req, res) => {

    // Demo account is read-only
    if (isDemoUser(req)) {
        return res.status(403).json({
            message: 'Demo account is read-only.'
        });
    }

    try {

        const { projectId } = req.params;

        const project =
            await projectService.leaveProject({
                projectId,
                userId: req.user._id
            });

        return res.status(200).json({
            project
        });

    } catch (err) {

        console.log(err);

        return res.status(400).json({
            error: err.message
        });
    }
};


// ============================================================
// INVITE BY EMAIL
// ============================================================

export const inviteByEmailController = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    // Demo account is read-only
    if (isDemoUser(req)) {
        return res.status(403).json({
            message: 'Demo account is read-only.'
        });
    }

    try {

        const {
            projectId,
            email
        } = req.body;

        const result =
            await projectService.inviteByEmail({
                projectId,
                email,
                inviter: req.user
            });

        return res.status(200).json(result);

    } catch (err) {

        console.log(err);

        return res.status(400).json({
            error: err.message
        });
    }
};