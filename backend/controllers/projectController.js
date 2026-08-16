import Project from '../models/Project.js';

const FREE_LAYER_LIMIT = 15;
function overLayerLimit(req) {
  return req.body.type === 'illustration' && req.user.plan === 'free' && (req.body.layers || []).length > FREE_LAYER_LIMIT;
}

// ... Implement listProjects, getProject, createProject, updateProject, deleteProject matching original script