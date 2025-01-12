import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function SignUp() {
  // Redirect to login page since signup is disabled
  return <Navigate to="/login" />;
}