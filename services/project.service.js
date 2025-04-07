import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

export const createProject = async ({
    name, userId
}) => {
    if (!name) {
        throw new Error('Name is required')
    }
    if (!userId) {
        throw new Error('UserId is required')
    }

    let project;
    try {
        project = await projectModel.create({
            name,
            users: [ userId ]
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project;

}


export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({
        users: userId
    })

    return allUserProjects
}

export const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!users) {
        throw new Error("users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }


    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    console.log(project)

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })

    return updatedProject



}

export const getProjectById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')

    return project;
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}

// Add these to your existing project.service.js

export const updateProject = async ({ projectId, updateData, userId }) => {
    const project = await projectModel.findOneAndUpdate(
        { _id: projectId, $or: [{ userId }, { users: userId }] },
        updateData,
        { new: true }
    );
    
    if (!project) {
        throw new Error('Project not found or unauthorized');
    }
    
    return project;
};

export const deleteProject = async ({ projectId, userId }) => {
    const result = await projectModel.findOneAndDelete({
        _id: projectId,
        $or: [{ userId }, { users: userId }]
    });
    
    if (!result) {
        throw new Error('Project not found or unauthorized');
    }
    
    return result;
};

export const removeUserFromProject = async ({ projectId, userIdToRemove, requestingUserId }) => {
    const project = await projectModel.findOne({
        _id: projectId,
        $or: [{ userId: requestingUserId }, { users: requestingUserId }]
    });
    
    if (!project) {
        throw new Error('Project not found or unauthorized');
    }
    
    // Only the owner can remove users
    if (project.userId.toString() !== requestingUserId.toString()) {
        throw new Error('Only the project owner can remove users');
    }
    
    // Can't remove yourself if you're the owner
    if (userIdToRemove === requestingUserId.toString()) {
        throw new Error('Project owner cannot remove themselves');
    }
    
    project.users = project.users.filter(user => user.toString() !== userIdToRemove);
    await project.save();
    
    return project;
};