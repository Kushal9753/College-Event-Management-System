export const loginFields = [
  {
    name: 'identifier',
    label: 'Email / Enrollment Number',
    type: 'text',
    placeholder: 'Enter your email or enrollment number',
    required: true,
    validation: (value) => {
      if (!value) return 'Email or Enrollment number is required';
      if (value.length < 5) return 'Must be at least 5 characters';
      return null;
    }
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
    validation: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      return null;
    }
  }
];

// Mock roles for the dropdown, in a real app this might be determined after login
export const mockRoles = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'admin', label: 'Admin' }
];
