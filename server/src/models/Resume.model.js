const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    parsedData: {
      workExperience: [
        {
          company: { type: String, default: '' },
          title: { type: String, default: '' },
          duration: { type: String, default: '' },
          keyAchievements: [{ type: String }],
          techStack: [{ type: String }]
        }
      ],
      projects: [
        {
          title: { type: String, default: '' },
          description: { type: String, default: '' },
          techStack: [{ type: String }],
          impactMetrics: [{ type: String }]
        }
      ],
      technicalSkills: [
        {
          category: { type: String, default: '' },
          skills: [{ type: String }]
        }
      ],
      verifiableClaims: [
        {
          claimText: { type: String, default: '' },
          metric: { type: String, default: '' },
          context: { type: String, default: '' }
        }
      ]
    }
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

module.exports = Resume;
