export const registerFields = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter your full name',
    required: true,
    validation: (value) => {
      if (!value) return 'Full name is required';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      return null;
    }
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter your email address',
    required: true,
    validation: (value) => {
      if (!value) return 'Email is required';
      if (!/^\S+@\S+\.\S+$/.test(value)) return 'Please enter a valid email address';
      return null;
    }
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Enter your phone number',
    required: true,
    validation: (value) => {
      if (!value) return 'Phone number is required';
      if (!/^\d{10}$/.test(value.replace(/[\s-]/g, ''))) return 'Please enter a valid 10-digit phone number';
      return null;
    }
  },
  {
    name: 'collegeName',
    label: 'College Name',
    type: 'text',
    placeholder: 'Enter your college name',
    required: true,
    validation: (value) => {
      if (!value) return 'College name is required';
      if (value.trim().length < 3) return 'College name must be at least 3 characters';
      return null;
    }
  },
  {
    name: 'enrollmentNumber',
    label: 'Enrollment Number',
    type: 'text',
    placeholder: 'Enter your enrollment number',
    required: true,
    validation: (value) => {
      if (!value) return 'Enrollment number is required';
      if (value.length < 5) return 'Enrollment number must be at least 5 characters';
      return null;
    }
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Create a password',
    required: true,
    validation: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return null;
    }
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Confirm your password',
    required: true,
    validation: (value, formData) => {
      if (!value) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
      return null;
    }
  }
];
