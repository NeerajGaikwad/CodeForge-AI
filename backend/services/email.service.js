import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'CodeForge AI <onboarding@resend.dev>'

// Send OTP
export const sendOTP = async (email, otp) => {
    try {
        const result = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Your CodeForge AI OTP',
            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 400px;
                    margin: auto;
                    padding: 25px;
                    background: #1e293b;
                    color: white;
                    border-radius: 12px;
                ">
                    <h2 style="color: #3b82f6;">
                        CodeForge AI Verification
                    </h2>

                    <p>Your verification OTP is:</p>

                    <h1 style="
                        letter-spacing: 8px;
                        color: #3b82f6;
                        font-size: 36px;
                    ">
                        ${otp}
                    </h1>

                    <p style="color: #94a3b8;">
                        This OTP is valid for 5 minutes.
                    </p>

                    <p style="color: #94a3b8;">
                        Do not share this OTP with anyone.
                    </p>
                </div>
            `
        })

        console.log(`✅ OTP email sent to ${email}`)
        console.log('Resend response:', result)

        return result
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error)
        throw error
    }
}


// Registered user project invitation
export const sendProjectInvite = async (
    email,
    { projectName, inviterName }
) => {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `${inviterName} invited you to collaborate on "${projectName}" - CodeForge AI`,
            html: `
                <div style="
                    font-family: Arial;
                    max-width: 400px;
                    margin: auto;
                    padding: 20px;
                    background: #1e293b;
                    color: white;
                    border-radius: 12px;
                ">
                    <h2 style="color: #3b82f6;">
                        New Project Invitation
                    </h2>

                    <p>
                        <strong>${inviterName}</strong>
                        has invited you to collaborate on
                        <strong>${projectName}</strong>
                        on CodeForge AI.
                    </p>

                    <a href="http://localhost:5173/home"
                        style="
                            display:inline-block;
                            margin-top:16px;
                            padding:10px 24px;
                            background:#3b82f6;
                            color:white;
                            text-decoration:none;
                            border-radius:8px;
                            font-weight:bold;
                        ">
                        View Invitation
                    </a>

                    <p style="
                        color:#94a3b8;
                        margin-top:16px;
                        font-size:13px;
                    ">
                        Log in to CodeForge AI to accept or decline this invite.
                    </p>
                </div>
            `
        })

        console.log(`✅ Project invitation sent to ${email}`)
    } catch (error) {
        console.error('❌ Failed to send project invitation:', error)
        throw error
    }
}


// Non-registered user signup invitation
export const sendProjectInviteSignup = async (
    email,
    { projectName, inviterName }
) => {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `${inviterName} invited you to join "${projectName}" on CodeForge AI`,
            html: `
                <div style="
                    font-family: Arial;
                    max-width: 400px;
                    margin: auto;
                    padding: 20px;
                    background: #1e293b;
                    color: white;
                    border-radius: 12px;
                ">
                    <h2 style="color: #3b82f6;">
                        You're invited to CodeForge AI 🚀
                    </h2>

                    <p>
                        <strong>${inviterName}</strong>
                        has invited you to collaborate on
                        <strong>${projectName}</strong>.
                    </p>

                    <p>
                        CodeForge AI is a real-time collaborative
                        coding platform powered by AI.
                    </p>

                    <a href="http://localhost:5173/register"
                        style="
                            display:inline-block;
                            margin-top:16px;
                            padding:10px 24px;
                            background:#3b82f6;
                            color:white;
                            text-decoration:none;
                            border-radius:8px;
                            font-weight:bold;
                        ">
                        Sign up & Join
                    </a>

                    <p style="
                        color:#94a3b8;
                        margin-top:16px;
                        font-size:13px;
                    ">
                        Create your free account with this email address
                        to automatically join the project.
                    </p>
                </div>
            `
        })

        console.log(`✅ Signup invitation sent to ${email}`)
    } catch (error) {
        console.error('❌ Failed to send signup invitation:', error)
        throw error
    }
}