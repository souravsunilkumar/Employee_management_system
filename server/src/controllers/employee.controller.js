const bcrypt = require('bcrypt');
const EmployeeModel = require('../models/emp.model');
const { config } = require('../config/config');

// Controller for employees to update their own profile
exports.updateEmployeeProfile = async (req, res) => {
    try {
        const employeeId = req.employeeId;
        const { name, mobile, address } = req.body;

        // Find the employee
        const employee = await EmployeeModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Update only allowed fields
        if (name) employee.name = name;
        if (mobile) employee.mobile = mobile;
        if (address) employee.address = address;

        await employee.save();

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
                userType: employee.userType
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
        const employeeId = req.employeeId;
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        // Find the employee
        const employee = await EmployeeModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Verify current password
        const isPasswordValid = await employee.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        employee.password = newPassword;
        await employee.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing employee password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
