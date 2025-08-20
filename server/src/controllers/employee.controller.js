const bcrypt = require('bcrypt');
const { EmpModel } = require('../models/emp.model');
const config = require('../config/config');

// Controller for employees to update their own profile
exports.updateEmployeeProfile = async (req, res) => {
    try {
        console.log('=== UPDATE EMPLOYEE PROFILE REQUEST ===');
        
        // Get the user ID from either the new or old structure
        const userId = req.user?.id || req.userId;
        if (!userId) {
            console.log('User ID not found in request');
            return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
        }
        
        console.log('Employee ID updating profile:', userId);
        const { name, mobile, address } = req.body;
        console.log('Update data:', { name, mobile, address });

        // Find the employee
        const employee = await EmpModel.findById(userId);
        if (!employee) {
            console.log('Employee not found');
            return res.status(404).json({ error: 'Employee not found' });
        }

        console.log('Employee found, updating fields');
        // Update only allowed fields
        if (name) employee.name = name;
        if (mobile) employee.mobile = mobile;
        if (address) employee.address = address;

        await employee.save();
        console.log('Profile updated successfully');

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                name: employee.name,
                email: employee.email,
                mobile: employee.mobile,
                role: employee.role,
                address: employee.address,
                empId: employee.empId,
                image: employee.image,
                salary: employee.salary,
                userType: config.userTypes.EMPLOYEE
            }
        });
    } catch (error) {
        console.error('Error updating employee profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller for employees to change their password
exports.changeEmployeePassword = async (req, res) => {
    try {
        console.log('=== CHANGE EMPLOYEE PASSWORD REQUEST ===');
        
        // Get the user ID from either the new or old structure
        const userId = req.user?.id || req.userId;
        if (!userId) {
            console.log('User ID not found in request');
            return res.status(401).json({ error: 'Authentication failed. Please log in again.' });
        }
        
        console.log('Employee ID changing password:', userId);
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            console.log('Missing password data');
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        // Find the employee
        const employee = await EmpModel.findById(userId);
        if (!employee) {
            console.log('Employee not found');
            return res.status(404).json({ error: 'Employee not found' });
        }

        console.log('Verifying current password');
        // Verify current password
        const isPasswordValid = await employee.comparePassword(currentPassword);
        if (!isPasswordValid) {
            console.log('Current password is incorrect');
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        console.log('Updating password');
        // Update password
        employee.password = newPassword;
        await employee.save();
        console.log('Password changed successfully');

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing employee password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
