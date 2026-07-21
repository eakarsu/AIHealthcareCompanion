import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AI Healthcare Companion API',
    version: '2.0.0',
    description: 'Complete API documentation for the AI Healthcare Companion application. This API provides health record management, AI-powered analysis, medication tracking, physical therapy exercises, skin scan analysis, vision testing, and more.',
    contact: {
      name: 'AI Healthcare Companion Support',
      email: 'support@healthcare.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    { url: '/api', description: 'API Server' }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and user registration' },
    { name: 'Medications', description: 'Medication tracking and AI drug interaction analysis' },
    { name: 'Physical Therapy', description: 'Physical therapy exercises and AI form analysis' },
    { name: 'Skin Scans', description: 'Skin condition tracking and AI analysis' },
    { name: 'Vision Tests', description: 'Vision test records and AI analysis' },
    { name: 'Medical History', description: 'Medical history records and AI insights' },
    { name: 'Search', description: 'Global search across all health data' },
    { name: 'Notifications', description: 'User notification management' },
    { name: 'Admin', description: 'Admin-only dashboard, user management, and audit logs' },
    { name: 'Feedback', description: 'User feedback submission' },
    { name: 'Contact', description: 'Public contact form' },
    { name: 'Export', description: 'Data export in CSV and JSON formats' },
    { name: 'GDPR', description: 'GDPR data export and account deletion' },
    { name: 'Settings', description: 'User settings and password management' },
    { name: 'Upload', description: 'File upload for images and videos' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from the login or register endpoint'
      }
    },
    schemas: {
      // ─── Core Models ───────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          name: { type: 'string', example: 'John Doe' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          emailVerified: { type: 'boolean', example: false },
          darkMode: { type: 'boolean', example: false },
          language: { type: 'string', example: 'en' },
          onboardingDone: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time', example: '2025-01-15T10:30:00.000Z' }
        }
      },
      Medication: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Lisinopril' },
          dosage: { type: 'string', example: '10mg' },
          frequency: { type: 'string', example: 'Once daily' },
          timeOfDay: { type: 'string', example: 'Morning' },
          startDate: { type: 'string', format: 'date-time', example: '2025-01-01T00:00:00.000Z' },
          endDate: { type: 'string', format: 'date-time', nullable: true, example: null },
          purpose: { type: 'string', example: 'Blood pressure management' },
          sideEffects: { type: 'string', nullable: true, example: 'Dry cough' },
          interactions: { type: 'string', nullable: true, example: null },
          notes: { type: 'string', nullable: true, example: 'Take with food' },
          isActive: { type: 'boolean', example: true },
          aiAnalysis: { type: 'string', nullable: true, example: null },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      MedicationInput: {
        type: 'object',
        required: ['name', 'dosage', 'frequency', 'timeOfDay', 'startDate', 'purpose'],
        properties: {
          name: { type: 'string', example: 'Lisinopril' },
          dosage: { type: 'string', example: '10mg' },
          frequency: { type: 'string', example: 'Once daily' },
          timeOfDay: { type: 'string', example: 'Morning' },
          startDate: { type: 'string', format: 'date-time', example: '2025-01-01T00:00:00.000Z' },
          endDate: { type: 'string', format: 'date-time', nullable: true, example: null },
          purpose: { type: 'string', example: 'Blood pressure management' },
          sideEffects: { type: 'string', example: 'Dry cough' },
          interactions: { type: 'string', example: '' },
          notes: { type: 'string', example: 'Take with food' },
          isActive: { type: 'boolean', example: true }
        }
      },
      PhysicalTherapy: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          exerciseName: { type: 'string', example: 'Knee Extension' },
          bodyPart: { type: 'string', example: 'Knee' },
          description: { type: 'string', example: 'Seated knee extension for quadriceps strengthening' },
          duration: { type: 'integer', example: 15, description: 'Duration in minutes' },
          repetitions: { type: 'integer', example: 12 },
          sets: { type: 'integer', example: 3 },
          difficulty: { type: 'string', example: 'moderate' },
          videoUrl: { type: 'string', nullable: true, example: null },
          instructions: { type: 'string', example: 'Sit on a chair, extend your knee slowly, hold for 3 seconds, then lower.' },
          precautions: { type: 'string', nullable: true, example: 'Stop if you feel sharp pain' },
          aiFormFeedback: { type: 'string', nullable: true, example: null },
          status: { type: 'string', enum: ['pending', 'completed'], example: 'pending' },
          completedAt: { type: 'string', format: 'date-time', nullable: true, example: null },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      PhysicalTherapyInput: {
        type: 'object',
        required: ['exerciseName', 'bodyPart', 'description', 'duration', 'repetitions', 'sets', 'difficulty', 'instructions'],
        properties: {
          exerciseName: { type: 'string', example: 'Knee Extension' },
          bodyPart: { type: 'string', example: 'Knee' },
          description: { type: 'string', example: 'Seated knee extension for quadriceps strengthening' },
          duration: { type: 'integer', example: 15 },
          repetitions: { type: 'integer', example: 12 },
          sets: { type: 'integer', example: 3 },
          difficulty: { type: 'string', example: 'moderate' },
          videoUrl: { type: 'string', example: '' },
          instructions: { type: 'string', example: 'Sit on a chair, extend your knee slowly, hold for 3 seconds, then lower.' },
          precautions: { type: 'string', example: 'Stop if you feel sharp pain' }
        }
      },
      SkinScan: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          imageUrl: { type: 'string', nullable: true, example: '/uploads/1234567890-skin.jpg' },
          bodyLocation: { type: 'string', example: 'Left forearm' },
          symptomDescription: { type: 'string', example: 'Red, itchy patch approximately 2cm in diameter' },
          duration: { type: 'string', example: '2 weeks' },
          severity: { type: 'string', example: 'moderate' },
          aiDiagnosis: { type: 'string', nullable: true, example: null },
          recommendations: { type: 'string', nullable: true, example: null },
          riskLevel: { type: 'string', nullable: true, enum: ['low', 'moderate', 'high'], example: null },
          followUpNeeded: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      SkinScanInput: {
        type: 'object',
        required: ['bodyLocation', 'symptomDescription', 'duration', 'severity'],
        properties: {
          imageUrl: { type: 'string', example: '/uploads/1234567890-skin.jpg' },
          bodyLocation: { type: 'string', example: 'Left forearm' },
          symptomDescription: { type: 'string', example: 'Red, itchy patch approximately 2cm in diameter' },
          duration: { type: 'string', example: '2 weeks' },
          severity: { type: 'string', example: 'moderate' }
        }
      },
      VisionTest: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          testType: { type: 'string', example: 'Snellen Chart' },
          leftEyeResult: { type: 'string', nullable: true, example: '20/25' },
          rightEyeResult: { type: 'string', nullable: true, example: '20/20' },
          colorVision: { type: 'string', nullable: true, example: 'Normal' },
          contrastSensitivity: { type: 'string', nullable: true, example: 'Normal' },
          nearVision: { type: 'string', nullable: true, example: '20/20' },
          distanceVision: { type: 'string', nullable: true, example: '20/25' },
          aiAnalysis: { type: 'string', nullable: true, example: null },
          recommendations: { type: 'string', nullable: true, example: null },
          testDate: { type: 'string', format: 'date-time', example: '2025-03-15T14:00:00.000Z' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      VisionTestInput: {
        type: 'object',
        required: ['testType'],
        properties: {
          testType: { type: 'string', example: 'Snellen Chart' },
          leftEyeResult: { type: 'string', example: '20/25' },
          rightEyeResult: { type: 'string', example: '20/20' },
          colorVision: { type: 'string', example: 'Normal' },
          contrastSensitivity: { type: 'string', example: 'Normal' },
          nearVision: { type: 'string', example: '20/20' },
          distanceVision: { type: 'string', example: '20/25' },
          testDate: { type: 'string', format: 'date-time', example: '2025-03-15T14:00:00.000Z' }
        }
      },
      MedicalHistory: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          condition: { type: 'string', example: 'Hypertension' },
          diagnosisDate: { type: 'string', format: 'date-time', example: '2023-06-15T00:00:00.000Z' },
          status: { type: 'string', example: 'ongoing' },
          treatingDoctor: { type: 'string', nullable: true, example: 'Dr. Smith' },
          hospital: { type: 'string', nullable: true, example: 'City General Hospital' },
          medications: { type: 'string', nullable: true, example: 'Lisinopril 10mg' },
          surgeries: { type: 'string', nullable: true, example: 'None' },
          allergies: { type: 'string', nullable: true, example: 'Penicillin' },
          familyHistory: { type: 'string', nullable: true, example: 'Father had hypertension' },
          notes: { type: 'string', nullable: true, example: 'Regular monitoring required' },
          aiInsights: { type: 'string', nullable: true, example: null },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      MedicalHistoryInput: {
        type: 'object',
        required: ['condition', 'diagnosisDate', 'status'],
        properties: {
          condition: { type: 'string', example: 'Hypertension' },
          diagnosisDate: { type: 'string', format: 'date-time', example: '2023-06-15T00:00:00.000Z' },
          status: { type: 'string', example: 'ongoing' },
          treatingDoctor: { type: 'string', example: 'Dr. Smith' },
          hospital: { type: 'string', example: 'City General Hospital' },
          medications: { type: 'string', example: 'Lisinopril 10mg' },
          surgeries: { type: 'string', example: 'None' },
          allergies: { type: 'string', example: 'Penicillin' },
          familyHistory: { type: 'string', example: 'Father had hypertension' },
          notes: { type: 'string', example: 'Regular monitoring required' }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          type: { type: 'string', example: 'medication_reminder' },
          title: { type: 'string', example: 'Medication Reminder' },
          message: { type: 'string', example: 'Time to take your Lisinopril 10mg' },
          read: { type: 'boolean', example: false },
          actionUrl: { type: 'string', nullable: true, example: '/medications/1' },
          scheduledAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      AuditLog: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', nullable: true, example: 1 },
          action: { type: 'string', example: 'CREATE' },
          resource: { type: 'string', example: 'medication' },
          resourceId: { type: 'string', nullable: true, example: '5' },
          details: { type: 'string', nullable: true, example: 'Created medication Lisinopril' },
          ipAddress: { type: 'string', nullable: true, example: '192.168.1.1' },
          createdAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            nullable: true,
            properties: {
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' }
            }
          }
        }
      },
      Feedback: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', nullable: true, example: 1 },
          type: { type: 'string', example: 'bug' },
          subject: { type: 'string', example: 'Login page issue' },
          message: { type: 'string', example: 'Unable to login with email containing special characters' },
          status: { type: 'string', example: 'open' },
          response: { type: 'string', nullable: true, example: null },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ContactMessage: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          subject: { type: 'string', example: 'Partnership Inquiry' },
          message: { type: 'string', example: 'We would like to discuss a potential partnership.' },
          status: { type: 'string', example: 'new' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      SnellenChartLine: {
        type: 'object',
        properties: {
          line: { type: 'integer', example: 1 },
          letters: { type: 'string', example: 'E' },
          size: { type: 'string', example: '20/200' }
        }
      },
      // ─── Response Schemas ──────────────────────────────────────────
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      AIAnalysisResponse: {
        type: 'object',
        properties: {
          record: { type: 'object', description: 'The updated record with saved AI analysis' },
          analysis: { type: 'string', example: 'Based on the provided information, here are the key findings...' },
          model: { type: 'string', example: 'google/gemini-2.0-flash-001' },
          usage: {
            type: 'object',
            properties: {
              prompt_tokens: { type: 'integer', example: 150 },
              completion_tokens: { type: 'integer', example: 300 },
              total_tokens: { type: 'integer', example: 450 }
            }
          }
        }
      },
      SkinAnalysisResponse: {
        type: 'object',
        properties: {
          record: { $ref: '#/components/schemas/SkinScan' },
          analysis: { type: 'string', example: 'Based on the described symptoms...' },
          riskLevel: { type: 'string', enum: ['low', 'moderate', 'high'], example: 'low' },
          model: { type: 'string', example: 'google/gemini-2.0-flash-001' },
          usage: { type: 'object' }
        }
      },
      SearchResponse: {
        type: 'object',
        properties: {
          query: { type: 'string', example: 'blood pressure' },
          totalResults: { type: 'integer', example: 5 },
          results: {
            type: 'object',
            properties: {
              medications: { type: 'array', items: { $ref: '#/components/schemas/Medication' } },
              physicalTherapy: { type: 'array', items: { $ref: '#/components/schemas/PhysicalTherapy' } },
              skinScans: { type: 'array', items: { $ref: '#/components/schemas/SkinScan' } },
              visionTests: { type: 'array', items: { $ref: '#/components/schemas/VisionTest' } },
              medicalHistory: { type: 'array', items: { $ref: '#/components/schemas/MedicalHistory' } }
            }
          }
        }
      },
      NotificationListResponse: {
        type: 'object',
        properties: {
          notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
          unreadCount: { type: 'integer', example: 3 },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },
      AdminStatsResponse: {
        type: 'object',
        properties: {
          users: { type: 'integer', example: 150 },
          medications: { type: 'integer', example: 450 },
          exercises: { type: 'integer', example: 200 },
          scans: { type: 'integer', example: 75 },
          tests: { type: 'integer', example: 90 },
          records: { type: 'integer', example: 300 },
          feedbacks: { type: 'integer', example: 25 },
          contacts: { type: 'integer', example: 10 }
        }
      },
      AdminUsersResponse: {
        type: 'object',
        properties: {
          users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          pages: { type: 'integer', example: 5 }
        }
      },
      GDPRExportResponse: {
        type: 'object',
        properties: {
          exportDate: { type: 'string', format: 'date-time' },
          gdprNotice: { type: 'string', example: 'This export contains all personal data stored in our system for your account.' },
          user: { $ref: '#/components/schemas/User' },
          medications: { type: 'array', items: { $ref: '#/components/schemas/Medication' } },
          physicalTherapy: { type: 'array', items: { $ref: '#/components/schemas/PhysicalTherapy' } },
          skinScans: { type: 'array', items: { $ref: '#/components/schemas/SkinScan' } },
          visionTests: { type: 'array', items: { $ref: '#/components/schemas/VisionTest' } },
          medicalHistory: { type: 'array', items: { $ref: '#/components/schemas/MedicalHistory' } },
          notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
          feedbacks: { type: 'array', items: { $ref: '#/components/schemas/Feedback' } }
        }
      },
      UploadResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          filename: { type: 'string', example: '1710000000000-123456789.jpg' },
          url: { type: 'string', example: '/uploads/1710000000000-123456789.jpg' },
          type: { type: 'string', example: 'image/jpeg' }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true }
        }
      },
      MessageResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'An error occurred' }
        }
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'OK' },
          timestamp: { type: 'string', format: 'date-time' },
          version: { type: 'string', example: '2.0.0' }
        }
      }
    }
  },
  paths: {
    // ═══════════════════════════════════════════════════════════════
    //  AUTH ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a new user account and returns JWT tokens. A verification email token is generated (logged in development).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', minLength: 12, example: 'use-a-secret-manager' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'User registered successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          },
          400: {
            description: 'Validation error (missing fields, password too short, or email already exists)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          500: {
            description: 'Registration failed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Authenticates a user with email and password, returns JWT access token and refresh token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'demo@healthcare.com' },
                  password: { type: 'string', example: 'use-a-secret-manager' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful, returns token and user data',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          },
          400: {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          500: {
            description: 'Login failed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        description: 'Returns the currently authenticated user profile based on the provided JWT token.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: {
            description: 'No token provided',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          403: {
            description: 'Invalid token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          404: {
            description: 'User not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset',
        description: 'Sends a password reset token to the given email address. Does not reveal whether the user exists for security reasons.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Reset link sent (always returns success to prevent user enumeration)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } }
          },
          400: {
            description: 'Email is required',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          500: {
            description: 'Failed to process request',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password with token',
        description: 'Resets the user password using a valid reset token obtained from the forgot-password endpoint. The token expires after 1 hour.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: { type: 'string', example: 'abc123resettoken...' },
                  newPassword: { type: 'string', minLength: 6, example: 'newPassword123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password has been reset successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } }
          },
          400: {
            description: 'Invalid or expired reset token, or missing fields',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          500: {
            description: 'Failed to reset password',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/auth/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verify email address',
        description: 'Verifies the user email address using the verification token sent during registration.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string', example: 'abc123verifytoken...' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email verified successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } }
          },
          400: {
            description: 'Invalid verification token or token is required',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          500: {
            description: 'Failed to verify email',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/auth/resend-verification': {
      post: {
        tags: ['Auth'],
        summary: 'Resend verification email',
        description: 'Generates a new email verification token and resends the verification email. Requires authentication.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Verification email resent or email is already verified',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } }
          },
          401: {
            description: 'No token provided',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          404: {
            description: 'User not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          500: {
            description: 'Failed to resend verification',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description: 'Generates a new access token and refresh token using a valid refresh token. The old refresh token is invalidated.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'New tokens generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Refresh token is required or invalid',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          401: {
            description: 'Refresh token expired, please login again',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          403: {
            description: 'Invalid refresh token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          404: {
            description: 'User not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  MEDICATIONS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/medications': {
      get: {
        tags: ['Medications'],
        summary: 'List all medications',
        description: 'Returns all medications for the authenticated user, ordered by creation date descending.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of medications',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Medication' } } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch medications', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      post: {
        tags: ['Medications'],
        summary: 'Create a new medication',
        description: 'Creates a new medication record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicationInput' } } }
        },
        responses: {
          200: {
            description: 'Medication created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Medication' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to create medication', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/medications/{id}': {
      get: {
        tags: ['Medications'],
        summary: 'Get a single medication',
        description: 'Returns a single medication by ID for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Medication ID', example: 1 }
        ],
        responses: {
          200: { description: 'Medication details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Medication' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Medication not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch medication', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      put: {
        tags: ['Medications'],
        summary: 'Update a medication',
        description: 'Updates an existing medication record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Medication ID', example: 1 }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicationInput' } } }
        },
        responses: {
          200: { description: 'Medication updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Medication' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to update medication', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      delete: {
        tags: ['Medications'],
        summary: 'Delete a medication',
        description: 'Permanently deletes a medication record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Medication ID', example: 1 }
        ],
        responses: {
          200: { description: 'Medication deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to delete medication', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/medications/{id}/analyze': {
      post: {
        tags: ['Medications'],
        summary: 'AI analysis for a single medication',
        description: 'Runs AI-powered drug interaction analysis on the specified medication against all other active medications. Saves the analysis result to the medication record.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Medication ID', example: 1 }
        ],
        responses: {
          200: {
            description: 'AI analysis result',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AIAnalysisResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Medication not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to analyze medication', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/medications/analyze-all': {
      post: {
        tags: ['Medications'],
        summary: 'AI analysis for all active medications',
        description: 'Runs a comprehensive AI-powered interaction analysis across all active medications for the authenticated user. Returns a holistic drug interaction report.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Comprehensive analysis result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    analysis: { type: 'string', example: 'Comprehensive analysis of your medication regimen...' },
                    model: { type: 'string', example: 'google/gemini-2.0-flash-001' },
                    usage: { type: 'object' }
                  }
                }
              }
            }
          },
          400: { description: 'No active medications found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to analyze medications', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  PHYSICAL THERAPY ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/physical-therapy': {
      get: {
        tags: ['Physical Therapy'],
        summary: 'List all exercises',
        description: 'Returns all physical therapy exercises for the authenticated user, ordered by creation date descending.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of exercises',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/PhysicalTherapy' } } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch exercises', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      post: {
        tags: ['Physical Therapy'],
        summary: 'Create a new exercise',
        description: 'Creates a new physical therapy exercise record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PhysicalTherapyInput' } } }
        },
        responses: {
          200: { description: 'Exercise created', content: { 'application/json': { schema: { $ref: '#/components/schemas/PhysicalTherapy' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to create exercise', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/physical-therapy/{id}': {
      get: {
        tags: ['Physical Therapy'],
        summary: 'Get a single exercise',
        description: 'Returns a single physical therapy exercise by ID for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Exercise ID', example: 1 }
        ],
        responses: {
          200: { description: 'Exercise details', content: { 'application/json': { schema: { $ref: '#/components/schemas/PhysicalTherapy' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Exercise not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch exercise', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      put: {
        tags: ['Physical Therapy'],
        summary: 'Update an exercise',
        description: 'Updates an existing physical therapy exercise record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Exercise ID', example: 1 }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PhysicalTherapyInput' } } }
        },
        responses: {
          200: { description: 'Exercise updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/PhysicalTherapy' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to update exercise', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      delete: {
        tags: ['Physical Therapy'],
        summary: 'Delete an exercise',
        description: 'Permanently deletes a physical therapy exercise record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Exercise ID', example: 1 }
        ],
        responses: {
          200: { description: 'Exercise deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to delete exercise', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/physical-therapy/{id}/complete': {
      post: {
        tags: ['Physical Therapy'],
        summary: 'Mark exercise as completed',
        description: 'Marks the specified physical therapy exercise as completed and records the completion timestamp.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Exercise ID', example: 1 }
        ],
        responses: {
          200: { description: 'Exercise marked as completed', content: { 'application/json': { schema: { $ref: '#/components/schemas/PhysicalTherapy' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to mark exercise as completed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/physical-therapy/{id}/analyze-form': {
      post: {
        tags: ['Physical Therapy'],
        summary: 'AI form analysis for exercise',
        description: 'Provides AI-powered feedback on exercise form and technique. Optionally include a description of how you are performing the exercise for personalized guidance.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Exercise ID', example: 1 }
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userDescription: { type: 'string', example: 'I am performing the knee extension while seated on a chair, lifting my leg slowly.' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'AI form analysis result',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AIAnalysisResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Exercise not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to analyze form', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  SKIN SCANS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/skin-scans': {
      get: {
        tags: ['Skin Scans'],
        summary: 'List all skin scans',
        description: 'Returns all skin scan records for the authenticated user, ordered by creation date descending.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of skin scans',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SkinScan' } } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch skin scans', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      post: {
        tags: ['Skin Scans'],
        summary: 'Create a new skin scan',
        description: 'Creates a new skin scan record for the authenticated user. Upload an image first using the upload endpoint and include the URL.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SkinScanInput' } } }
        },
        responses: {
          200: { description: 'Skin scan created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SkinScan' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to create skin scan', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/skin-scans/{id}': {
      get: {
        tags: ['Skin Scans'],
        summary: 'Get a single skin scan',
        description: 'Returns a single skin scan record by ID for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Skin scan ID', example: 1 }
        ],
        responses: {
          200: { description: 'Skin scan details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SkinScan' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Skin scan not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch skin scan', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      put: {
        tags: ['Skin Scans'],
        summary: 'Update a skin scan',
        description: 'Updates an existing skin scan record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Skin scan ID', example: 1 }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SkinScanInput' } } }
        },
        responses: {
          200: { description: 'Skin scan updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SkinScan' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to update skin scan', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      delete: {
        tags: ['Skin Scans'],
        summary: 'Delete a skin scan',
        description: 'Permanently deletes a skin scan record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Skin scan ID', example: 1 }
        ],
        responses: {
          200: { description: 'Skin scan deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to delete skin scan', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/skin-scans/{id}/analyze': {
      post: {
        tags: ['Skin Scans'],
        summary: 'AI skin condition analysis',
        description: 'Runs AI-powered analysis on the skin scan description and symptoms. Returns a risk level (low, moderate, high) and recommendations. The AI analysis is saved to the scan record.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Skin scan ID', example: 1 }
        ],
        responses: {
          200: {
            description: 'AI skin analysis result',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SkinAnalysisResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Skin scan not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to analyze skin condition', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  VISION TESTS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/vision-tests': {
      get: {
        tags: ['Vision Tests'],
        summary: 'List all vision tests',
        description: 'Returns all vision test records for the authenticated user, ordered by test date descending.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of vision tests',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/VisionTest' } } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch vision tests', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      post: {
        tags: ['Vision Tests'],
        summary: 'Create a new vision test',
        description: 'Creates a new vision test record for the authenticated user. If testDate is not provided, the current date is used.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VisionTestInput' } } }
        },
        responses: {
          200: { description: 'Vision test created', content: { 'application/json': { schema: { $ref: '#/components/schemas/VisionTest' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to create vision test', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/vision-tests/{id}': {
      get: {
        tags: ['Vision Tests'],
        summary: 'Get a single vision test',
        description: 'Returns a single vision test record by ID for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Vision test ID', example: 1 }
        ],
        responses: {
          200: { description: 'Vision test details', content: { 'application/json': { schema: { $ref: '#/components/schemas/VisionTest' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Vision test not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch vision test', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      put: {
        tags: ['Vision Tests'],
        summary: 'Update a vision test',
        description: 'Updates an existing vision test record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Vision test ID', example: 1 }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VisionTestInput' } } }
        },
        responses: {
          200: { description: 'Vision test updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/VisionTest' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to update vision test', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      delete: {
        tags: ['Vision Tests'],
        summary: 'Delete a vision test',
        description: 'Permanently deletes a vision test record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Vision test ID', example: 1 }
        ],
        responses: {
          200: { description: 'Vision test deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to delete vision test', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/vision-tests/{id}/analyze': {
      post: {
        tags: ['Vision Tests'],
        summary: 'AI vision test analysis',
        description: 'Runs AI-powered analysis on the vision test results. Provides recommendations and saves the analysis to the test record. Always advises consulting an eye care professional.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Vision test ID', example: 1 }
        ],
        responses: {
          200: {
            description: 'AI vision analysis result',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AIAnalysisResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Vision test not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to analyze vision test', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/vision-tests/chart/snellen': {
      get: {
        tags: ['Vision Tests'],
        summary: 'Get Snellen eye chart data',
        description: 'Returns the standard Snellen visual acuity chart data with letters and sizes for each line. This endpoint does not require authentication.',
        responses: {
          200: {
            description: 'Snellen chart lines',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/SnellenChartLine' }
                },
                example: [
                  { line: 1, letters: 'E', size: '20/200' },
                  { line: 2, letters: 'FP', size: '20/100' },
                  { line: 8, letters: 'DEFPOTEC', size: '20/20' }
                ]
              }
            }
          }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  MEDICAL HISTORY ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/medical-history': {
      get: {
        tags: ['Medical History'],
        summary: 'List all medical history records',
        description: 'Returns all medical history records for the authenticated user, ordered by diagnosis date descending.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of medical history records',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/MedicalHistory' } } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch medical history', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      post: {
        tags: ['Medical History'],
        summary: 'Create a medical history record',
        description: 'Creates a new medical history record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicalHistoryInput' } } }
        },
        responses: {
          200: { description: 'Medical history record created', content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicalHistory' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to create medical history', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/medical-history/{id}': {
      get: {
        tags: ['Medical History'],
        summary: 'Get a single medical history record',
        description: 'Returns a single medical history record by ID for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Medical history record ID', example: 1 }
        ],
        responses: {
          200: { description: 'Medical history record details', content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicalHistory' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Medical history record not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch medical history', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      put: {
        tags: ['Medical History'],
        summary: 'Update a medical history record',
        description: 'Updates an existing medical history record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Medical history record ID', example: 1 }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicalHistoryInput' } } }
        },
        responses: {
          200: { description: 'Medical history record updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicalHistory' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to update medical history', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      delete: {
        tags: ['Medical History'],
        summary: 'Delete a medical history record',
        description: 'Permanently deletes a medical history record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Medical history record ID', example: 1 }
        ],
        responses: {
          200: { description: 'Medical history record deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to delete medical history', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/medical-history/{id}/analyze': {
      post: {
        tags: ['Medical History'],
        summary: 'AI analysis for a medical history record',
        description: 'Runs AI-powered analysis on the specified medical history record in the context of the user\'s complete medical history. Provides insights, risk factors, and recommendations.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Medical history record ID', example: 1 }
        ],
        responses: {
          200: {
            description: 'AI medical history analysis result',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AIAnalysisResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Medical history record not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to analyze medical history', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/medical-history/analyze-all': {
      post: {
        tags: ['Medical History'],
        summary: 'AI analysis for complete medical history',
        description: 'Runs a comprehensive AI-powered analysis across the user\'s entire medical history. Provides a holistic health view, identifies patterns, potential risk factors, and preventive care recommendations.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Comprehensive medical history analysis',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    analysis: { type: 'string', example: 'Comprehensive analysis of your medical history...' },
                    model: { type: 'string', example: 'google/gemini-2.0-flash-001' },
                    usage: { type: 'object' }
                  }
                }
              }
            }
          },
          400: { description: 'No medical history found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to analyze medical history', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  SEARCH ENDPOINT
    // ═══════════════════════════════════════════════════════════════
    '/search': {
      get: {
        tags: ['Search'],
        summary: 'Global search across all health data',
        description: 'Searches across medications, physical therapy exercises, skin scans, vision tests, and medical history records. Returns up to 10 results per category. Requires a minimum 2-character query.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string', minLength: 2 },
            description: 'Search query (minimum 2 characters)',
            example: 'blood pressure'
          },
          {
            name: 'type',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['medications', 'physical-therapy', 'skin-scans', 'vision-tests', 'medical-history'] },
            description: 'Filter search to a specific data type. If omitted, searches all types.'
          }
        ],
        responses: {
          200: {
            description: 'Search results grouped by category',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchResponse' } } }
          },
          400: { description: 'Search query must be at least 2 characters', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Search failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  NOTIFICATIONS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications',
        description: 'Returns paginated notifications for the authenticated user, ordered by creation date descending. Includes the total unread count.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Items per page' },
          { name: 'unreadOnly', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filter to only unread notifications' }
        ],
        responses: {
          200: {
            description: 'Paginated notification list with unread count',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/NotificationListResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch notifications', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark a notification as read',
        description: 'Marks a single notification as read for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Notification ID', example: 1 }
        ],
        responses: {
          200: { description: 'Notification marked as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to mark notification as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/notifications/read-all': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        description: 'Marks all unread notifications as read for the authenticated user.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All notifications marked as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to mark all notifications as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete a notification',
        description: 'Permanently deletes a notification for the authenticated user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Notification ID', example: 1 }
        ],
        responses: {
          200: { description: 'Notification deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to delete notification', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  ADMIN ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Get platform statistics',
        description: 'Returns aggregate counts for all major entities in the system. Requires admin role.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Platform statistics',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminStatsResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch stats', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users',
        description: 'Returns a paginated list of all registered users. Requires admin role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Items per page' }
        ],
        responses: {
          200: {
            description: 'Paginated list of users',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminUsersResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch users', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/admin/users/{id}/role': {
      put: {
        tags: ['Admin'],
        summary: 'Update user role',
        description: 'Changes the role of a specific user. Valid roles are "user" and "admin". Requires admin role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'User ID', example: 2 }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['user', 'admin'], example: 'admin' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'User role updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 2 },
                    email: { type: 'string', example: 'user@example.com' },
                    name: { type: 'string', example: 'Jane Doe' },
                    role: { type: 'string', example: 'admin' }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid role', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to update user role', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/admin/audit-logs': {
      get: {
        tags: ['Admin'],
        summary: 'Get audit logs',
        description: 'Returns paginated audit logs with associated user information. Requires admin role.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Items per page' }
        ],
        responses: {
          200: {
            description: 'Paginated audit logs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    logs: { type: 'array', items: { $ref: '#/components/schemas/AuditLog' } },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch audit logs', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/admin/feedbacks': {
      get: {
        tags: ['Admin'],
        summary: 'Get all user feedbacks',
        description: 'Returns all feedback submissions with associated user information. Requires admin role.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of all feedbacks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    allOf: [
                      { $ref: '#/components/schemas/Feedback' },
                      {
                        type: 'object',
                        properties: {
                          user: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', example: 'John Doe' },
                              email: { type: 'string', example: 'john@example.com' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch feedbacks', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/admin/contacts': {
      get: {
        tags: ['Admin'],
        summary: 'Get all contact messages',
        description: 'Returns all contact form submissions, ordered by creation date descending. Requires admin role.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of all contact messages',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ContactMessage' } } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch contact messages', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  FEEDBACK ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/feedback': {
      get: {
        tags: ['Feedback'],
        summary: 'Get user feedbacks',
        description: 'Returns all feedback submissions by the authenticated user, ordered by creation date descending.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of user feedbacks',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Feedback' } } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch feedbacks', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      post: {
        tags: ['Feedback'],
        summary: 'Submit feedback',
        description: 'Creates a new feedback submission from the authenticated user.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'subject', 'message'],
                properties: {
                  type: { type: 'string', example: 'bug', description: 'Feedback type (e.g., bug, feature, general)' },
                  subject: { type: 'string', example: 'Login page issue' },
                  message: { type: 'string', example: 'Unable to login with email containing special characters' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Feedback submitted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Feedback' } } } },
          400: { description: 'Type, subject, and message are required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to submit feedback', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  CONTACT ENDPOINT
    // ═══════════════════════════════════════════════════════════════
    '/contact': {
      post: {
        tags: ['Contact'],
        summary: 'Submit contact form',
        description: 'Submits a contact form message. This endpoint is public and does not require authentication.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'subject', 'message'],
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  subject: { type: 'string', example: 'Partnership Inquiry' },
                  message: { type: 'string', example: 'We would like to discuss a potential partnership with your platform.' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Message sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Your message has been sent. We will get back to you soon.' }
                  }
                }
              }
            }
          },
          400: { description: 'All fields are required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to send message', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  EXPORT ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/export/csv/{type}': {
      get: {
        tags: ['Export'],
        summary: 'Export data as CSV',
        description: 'Exports user health data in CSV format. Downloads as a CSV file attachment.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['medications', 'physical-therapy', 'skin-scans', 'vision-tests', 'medical-history'] },
            description: 'The type of data to export'
          }
        ],
        responses: {
          200: {
            description: 'CSV file download',
            content: {
              'text/csv': {
                schema: { type: 'string' },
                example: 'Name,Dosage,Frequency,Time of Day,Purpose,Side Effects,Active,Start Date,Notes\nLisinopril,10mg,Once daily,Morning,Blood pressure,Dry cough,Yes,1/1/2025,'
              }
            }
          },
          400: { description: 'Invalid export type', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Export failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/export/json/all': {
      get: {
        tags: ['Export'],
        summary: 'Export all data as JSON',
        description: 'Exports all user health data (user profile, medications, physical therapy, skin scans, vision tests, medical history) as a single JSON file download.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'JSON file download containing all user data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    exportDate: { type: 'string', format: 'date-time' },
                    user: { $ref: '#/components/schemas/User' },
                    medications: { type: 'array', items: { $ref: '#/components/schemas/Medication' } },
                    physicalTherapy: { type: 'array', items: { $ref: '#/components/schemas/PhysicalTherapy' } },
                    skinScans: { type: 'array', items: { $ref: '#/components/schemas/SkinScan' } },
                    visionTests: { type: 'array', items: { $ref: '#/components/schemas/VisionTest' } },
                    medicalHistory: { type: 'array', items: { $ref: '#/components/schemas/MedicalHistory' } }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Export failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  GDPR ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/gdpr/export': {
      get: {
        tags: ['GDPR'],
        summary: 'GDPR data export',
        description: 'Exports all personal data stored for the authenticated user, including user profile, medications, physical therapy exercises, skin scans, vision tests, medical history, notifications, and feedbacks. Compliant with GDPR data portability requirements.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Complete GDPR data export',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GDPRExportResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to export data', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/gdpr/delete-account': {
      delete: {
        tags: ['GDPR'],
        summary: 'Delete account and all data',
        description: 'Permanently deletes the authenticated user\'s account and ALL associated data including notifications, feedbacks, audit logs, medications, physical therapy exercises, skin scans, vision tests, and medical history. This action is irreversible.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Account and all data permanently deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Your account and all associated data have been permanently deleted.' }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to delete account', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  SETTINGS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    '/settings': {
      get: {
        tags: ['Settings'],
        summary: 'Get user settings',
        description: 'Returns the current settings for the authenticated user including dark mode preference and language.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User settings',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    darkMode: { type: 'boolean', example: false },
                    language: { type: 'string', example: 'en' },
                    emailVerified: { type: 'boolean', example: true },
                    onboardingDone: { type: 'boolean', example: true }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to fetch settings', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      put: {
        tags: ['Settings'],
        summary: 'Update user settings',
        description: 'Updates the settings for the authenticated user. Supports updating dark mode, language, and onboarding status.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  darkMode: { type: 'boolean', example: true },
                  language: { type: 'string', example: 'en' },
                  onboardingDone: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Settings updated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to update settings', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/settings/password': {
      put: {
        tags: ['Settings'],
        summary: 'Change password',
        description: 'Changes the password for the authenticated user. Requires the current password for verification.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', example: 'oldPassword123' },
                  newPassword: { type: 'string', minLength: 6, example: 'newSecurePassword456' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password changed successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } }
          },
          400: {
            description: 'Current password is incorrect or new password too short',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to change password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/settings/profile': {
      put: {
        tags: ['Settings'],
        summary: 'Update user profile',
        description: 'Updates the profile information for the authenticated user, such as name and email.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'John Smith' },
                  email: { type: 'string', format: 'email', example: 'john.smith@example.com' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to update profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  UPLOAD ENDPOINT
    // ═══════════════════════════════════════════════════════════════
    '/upload': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a file',
        description: 'Uploads an image or video file. Accepted formats: JPEG, JPG, PNG, GIF, WebP, MP4, WebM. Maximum file size: 10MB. Returns the uploaded file URL to be used in other records (e.g., skin scan imageUrl).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image or video file (JPEG, JPG, PNG, GIF, WebP, MP4, WebM). Max 10MB.'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'File uploaded successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadResponse' } } }
          },
          400: { description: 'No file uploaded or invalid file type', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Failed to upload file', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    //  HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns the server status, current timestamp, and API version. Used for monitoring and uptime checks.',
        responses: {
          200: {
            description: 'Server is healthy',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthCheck' } } }
          }
        }
      }
    }
  }
};

export function setupSwagger(app) {
  const specs = swaggerJsdoc({
    swaggerDefinition,
    apis: []
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2em; }
      .swagger-ui .scheme-container { background: #fafafa; padding: 15px; }
    `,
    customSiteTitle: 'AI Healthcare Companion API Docs',
    customfavIcon: '',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true
    }
  }));

  console.log('Swagger API documentation available at /api-docs');
}
