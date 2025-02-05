import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Project, ProjectStatus, ProjectType } from '../types';
import { firestoreService } from '../services/firestore';

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'analysis' as ProjectStatus,
    startDate: new Date(),
    endDate: null as Date | null,
    description: '',
    billable: false,
    type: 'commercial' as ProjectType,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsData = await firestoreService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      setProjects([]);
    }
  };

  const handleOpen = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate || null,
        description: project.description,
        billable: project.billable,
        type: project.type,
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        status: 'analysis',
        startDate: new Date(),
        endDate: null,
        description: '',
        billable: false,
        type: 'commercial',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        console.error('Le nom du projet est requis');
        return;
      }

      const projectData = {
        name: formData.name.trim(),
        status: formData.status,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
        description: formData.description.trim(),
        billable: Boolean(formData.billable),
        type: formData.type,
      };

      if (editingProject) {
        await firestoreService.updateProject(editingProject.id, projectData);
      } else {
        await firestoreService.addProject(projectData);
      }

      await fetchProjects();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du projet:', error);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      await firestoreService.deleteProject(projectId);
      await fetchProjects();
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <h1>Gestion des Projets</h1>
        <Button variant="contained" onClick={() => handleOpen()}>
          Nouveau Projet
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date de début</TableCell>
              <TableCell>Date de fin</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.status}</TableCell>
                <TableCell>{project.type}</TableCell>
                <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(project)}>Modifier</Button>
                  <Button color="error" onClick={() => handleDelete(project.id)}>
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingProject ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nom du projet"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <FormControl>
              <InputLabel>Statut</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                <MenuItem value="analysis">En analyse</MenuItem>
                <MenuItem value="estimation">En chiffrage</MenuItem>
                <MenuItem value="proposal">En offre</MenuItem>
                <MenuItem value="negotiation">En négociation</MenuItem>
                <MenuItem value="won">Gagné</MenuItem>
                <MenuItem value="lost">Perdu</MenuItem>
                <MenuItem value="in_progress">En cours</MenuItem>
                <MenuItem value="completed">Terminé</MenuItem>
                <MenuItem value="abandoned">Abandonné</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="Date de début"
              value={formData.startDate}
              onChange={(newValue) => setFormData({ ...formData, startDate: newValue || new Date() })}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <DatePicker
              label="Date de fin"
              value={formData.endDate}
              onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <TextField
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
              >
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="internal">Interne</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProject ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 