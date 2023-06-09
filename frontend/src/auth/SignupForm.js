import React, { useState } from "react";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";

const SignupForm = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		interests: []
	});
	const [errors, setErrors] = useState({});

	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(prevFormData => ({
			...prevFormData,
			[name]: value
		}));
	};

	const handleSubmit = e => {
		e.preventDefault();
		const validationErrors = validateForm(formData);
		if (Object.keys(validationErrors).length === 0) {
			// Submit the form
			console.log("Form submitted:", formData);
		} else {
			setErrors(validationErrors);
		}
	};

	const validateForm = data => {
		const errors = {};

		if (!data.firstName.trim()) {
			errors.firstName = "First name is required";
		}

		if (!data.lastName.trim()) {
			errors.lastName = "Last name is required";
		}

		if (!data.email.trim()) {
			errors.email = "Email is required";
		} else if (!isValidEmail(data.email)) {
			errors.email = "Invalid email address";
		}

		if (!data.password.trim()) {
			errors.password = "Password is required";
		} else if (!isValidPassword(data.password)) {
			errors.password =
				"Password must be at least 8 characters long and contain at least one letter and one number";
		}

		if (data.interests.length === 0) {
			errors.interests = "Select at least one interest";
		} else if (data.interests.length > 3) {
			errors.interests = "Select up to three interests";
		}

		return errors;
	};

	const isValidEmail = email => {
		// Perform email validation here
		// You can use regular expressions or other validation libraries
		// Return true if the email is valid, false otherwise
		return /\S+@\S+\.\S+/.test(email);
	};

	const isValidPassword = password => {
		// Perform password validation here
		// You can use regular expressions or other validation logic
		// Return true if the password is valid, false otherwise
		return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
	};

	return (
		<Form onSubmit={handleSubmit}>
			<FormGroup>
				<Label for="firstName">First Name</Label>
				<Input
					type="text"
					name="firstName"
					id="firstName"
					value={formData.firstName}
					onChange={handleChange}
					invalid={!!errors.firstName}
				/>
				{errors.firstName && <div className="error">{errors.firstName}</div>}
			</FormGroup>
			<FormGroup>
				<Label for="lastName">Last Name</Label>
				<Input
					type="text"
					name="lastName"
					id="lastName"
					value={formData.lastName}
					onChange={handleChange}
					invalid={!!errors.lastName}
				/>
				{errors.lastName && <div className="error">{errors.lastName}</div>}
			</FormGroup>
			<FormGroup>
				<Label for="email">Email</Label>
				<Input
					type="email"
					name="email"
					id="email"
					value={formData.email}
					onChange={handleChange}
					invalid={!!errors.email}
				/>
				{errors.email && <div className="error">{errors.email}</div>}
			</FormGroup>
			<FormGroup>
				<Label for="password">Password</Label>
				<Input
					type="password"
					name="password"
					id="password"
					value={formData.password}
					onChange={handleChange}
					invalid={!!errors.password}
				/>
				{errors.password && <div className="error">{errors.password}</div>}
			</FormGroup>
			<FormGroup>
				<Label for="interests">Interests</Label>
				<div>
					<Input
						type="checkbox"
						name="interests"
						id="interest1"
						value="interest1"
						onChange={handleChange}
					/>
					<Label
						for="interest1"
						className="ml-2">
						Interest 1
					</Label>
				</div>
				<div>
					<Input
						type="checkbox"
						name="interests"
						id="interest2"
						value="interest2"
						onChange={handleChange}
					/>
					<Label
						for="interest2"
						className="ml-2">
						Interest 2
					</Label>
				</div>
				<div>
					<Input
						type="checkbox"
						name="interests"
						id="interest3"
						value="interest3"
						onChange={handleChange}
					/>
					<Label
						for="interest3"
						className="ml-2">
						Interest 3
					</Label>
				</div>
				{errors.interests && <div className="error">{errors.interests}</div>}
			</FormGroup>
			<Button type="submit">Submit</Button>
		</Form>
	);
};

export default SignupForm;
