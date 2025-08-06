import Joi from 'joi';

// Flexible validation schema for the new question format
export const questionSearchSchema = Joi.object({
  // New flexible fields (all nullable)
  pattern: Joi.string().trim().allow(null, '').optional(),
  passageId: Joi.string().trim().allow(null, '').optional(),
  section: Joi.string().trim().allow(null, '').optional(),
  questionNumber: Joi.number().integer().allow(null).optional(),
  directions: Joi.string().trim().max(2000).allow(null, '').optional(),
  passage: Joi.string().trim().max(5000).allow(null, '').optional(),
  questionText: Joi.string().trim().max(2000).allow(null, '').optional(),
  statements: Joi.string().trim().max(2000).allow(null, '').optional(),
  conclusions: Joi.string().trim().max(2000).allow(null, '').optional(),
  
  // Legacy fields for backward compatibility
  question: Joi.string().trim().max(2000).allow(null, '').optional(),
  questionImage: Joi.string().trim().max(1000).uri().allow(null, '').optional(),
  description: Joi.string().trim().max(1500).allow(null, '').optional(),
  
  // Flexible options format - can be array or object
  options: Joi.alternatives().try(
    // Array format: [{ text: "option1", images: null }, ...]
    Joi.array().items(
      Joi.object({
        text: Joi.string().trim().max(500).allow(null, '').optional(),
        images: Joi.string().trim().max(1000).uri().allow(null, '').optional()
      })
    ),
    // Object format: { A: "option1", B: "option2", ... } (legacy)
    Joi.object({
      A: Joi.string().max(500).allow('').optional(),
      AImage: Joi.string().max(1000).uri().allow('').optional(),
      B: Joi.string().max(500).allow('').optional(),
      BImage: Joi.string().max(1000).uri().allow('').optional(),
      C: Joi.string().max(500).allow('').optional(),
      CImage: Joi.string().max(1000).uri().allow('').optional(),
      D: Joi.string().max(500).allow('').optional(),
      DImage: Joi.string().max(1000).uri().allow('').optional()
    }),
    // Allow null options
    Joi.allow(null)
  ).optional(),
  
  // Flexible correct answers (optional for initial creation)
  CorrectAns: Joi.alternatives().try(
    Joi.array().items(
      Joi.object({
        text: Joi.string().trim().max(500).allow(null, '').optional(),
        images: Joi.string().trim().max(1000).uri().allow(null, '').optional()
      })
    ),
    Joi.allow(null)
  ).optional()
}).custom((value, helpers) => {
  // Custom validation: at least one content field should be provided
  const hasContent = 
    value.questionText || 
    value.question || 
    value.questionImage || 
    value.passage || 
    value.statements || 
    value.directions;
    
  if (!hasContent) {
    return helpers.error('custom.noContent');
  }
  
  return value;
}, 'Content validation').messages({
  'custom.noContent': 'At least one content field (questionText, question, questionImage, passage, statements, or directions) must be provided'
});

// Validation for question creation
export const createQuestionSchema = Joi.object({
  pattern: Joi.string().trim().default('STANDARD_MCQ'),
  passageId: Joi.string().trim().allow(null, '').optional(),
  section: Joi.string().trim().max(100).allow(null, '').optional(),
  questionNumber: Joi.number().integer().min(1).allow(null).optional(),
  directions: Joi.string().trim().max(2000).allow(null, '').optional(),
  passage: Joi.string().trim().max(5000).allow(null, '').optional(),
  questionText: Joi.string().trim().max(2000).allow(null, '').optional(),
  statements: Joi.string().trim().max(2000).allow(null, '').optional(),
  conclusions: Joi.string().trim().max(2000).allow(null, '').optional(),
  
  options: Joi.array().items(
    Joi.object({
      text: Joi.string().trim().max(500).allow(null, '').optional(),
      images: Joi.string().trim().max(1000).uri().allow(null, '').optional()
    })
  ).default([]),
  
  CorrectAns: Joi.array().items(
    Joi.object({
      text: Joi.string().trim().max(500).allow(null, '').optional(),
      images: Joi.string().trim().max(1000).uri().allow(null, '').optional()
    })
  ).default([])
}).custom((value, helpers) => {
  // At least one content field required
  const hasContent = 
    value.questionText || 
    value.passage || 
    value.statements || 
    value.directions;
    
  if (!hasContent) {
    return helpers.error('custom.noContent');
  }
  
  return value;
}, 'Content validation').messages({
  'custom.noContent': 'At least one content field must be provided for question creation'
});

// Update answer validation
export const updateAnswerSchema = Joi.object({
  CorrectAns: Joi.array().items(
    Joi.object({
      text: Joi.string().trim().max(500).allow(null, '').optional(),
      images: Joi.string().trim().max(1000).uri().allow(null, '').optional()
    })
  ).min(1).required().messages({
    'array.min': 'At least one correct answer must be provided',
    'any.required': 'Correct answers are required'
  })
});

// User registration schema
export const userRegistrationSchema = Joi.object({
  NameOfStu: Joi.string()
    .min(2)
    .max(100)
    .required()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.empty': 'Student name is required',
      'string.min': 'Student name must be at least 2 characters',
      'string.max': 'Student name cannot exceed 100 characters',
      'string.pattern.base': 'Student name must contain only letters and spaces',
      'any.required': 'Student name is required'
    }),
  
  StuID: Joi.string()
    .min(3)
    .max(50)
    .required()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      'string.empty': 'Student ID is required',
      'string.min': 'Student ID must be at least 3 characters',
      'string.max': 'Student ID cannot exceed 50 characters',
      'string.pattern.base': 'Student ID must contain only letters, numbers, underscores, and hyphens',
      'any.required': 'Student ID is required'
    }),
  
  AccessKey: Joi.string()
    .min(8)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Access key is required',
      'string.min': 'Access key must be at least 8 characters',
      'string.max': 'Access key cannot exceed 100 characters',
      'any.required': 'Access key is required'
    })
});

// Access key verification schema
export const accessKeyVerificationSchema = Joi.object({
  AccessKey: Joi.string()
    .min(8)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Access key is required',
      'string.min': 'Access key must be at least 8 characters',
      'string.max': 'Access key cannot exceed 100 characters',
      'any.required': 'Access key is required'
    })
});

// Profile update schema
export const profileUpdateSchema = Joi.object({
  NameOfStu: Joi.string()
    .min(2)
    .max(100)
    .required()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.empty': 'Student name is required',
      'string.min': 'Student name must be at least 2 characters',
      'string.max': 'Student name cannot exceed 100 characters',
      'string.pattern.base': 'Student name must contain only letters and spaces',
      'any.required': 'Student name is required'
    })
});

// Generic validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false, // Allow unknown fields for flexibility
      allowUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join('. ');
      
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorMessage,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }

    req.validatedBody = value;
    next();
  };
};

// Specific validation middleware
export const validateQuestionSearch = validateRequest(questionSearchSchema);
export const validateCreateQuestion = validateRequest(createQuestionSchema);
export const validateUpdateAnswer = validateRequest(updateAnswerSchema);
export const validateUserRegistration = validateRequest(userRegistrationSchema);
export const validateAccessKeyVerification = validateRequest(accessKeyVerificationSchema);
export const validateProfileUpdate = validateRequest(profileUpdateSchema);
