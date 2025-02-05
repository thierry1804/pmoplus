import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Developer } from '../types';

export default function DeveloperManagement() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [open, setOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    position: '',
    technicalSkills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'developers'));
      setDevelopers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Developer)));
    } catch (error) {
      console.error('Error fetching developers:', error);
    }
  };

  const handleOpen = (developer?: Developer) => {
    if (developer) {
      setEditingDeveloper(developer);
      setFormData({
        firstName: developer.firstName,
        lastName: developer.lastName,
        employeeId: developer.employeeId,
        position: developer.position,
        technicalSkills: [...developer.technicalSkills],
      });
    } else {
      setEditingDeveloper(null);
      setFormData({
        firstName: '',
        lastName: '',
        employeeId: '',
        position: '',
        technicalSkills: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDeveloper(null);
    setNewSkill('');
  };

  const handleSubmit = async () => {
    try {
      if (editingDeveloper) {
        await updateDoc(doc(db, 'developers', editingDeveloper.id), formData);
      } else {
        await addDoc(collection(db, 'developers'), formData);
      }
      handleClose();
      fetchDevelopers();
    } catch (error) {
      console.error('Error saving developer:', error);
    }
  };

  const handleDelete = async (developerId: string) => {
    try {
      await deleteDoc(doc(db, 'developers', developerId));
      fetchDevelopers();
    } catch (error) {
      console.error('Error deleting developer:', error);
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !formData.technicalSkills.includes(newSkill)) {
      setFormData({
        ...formData,
        technicalSkills: [...formData.technicalSkills, newSkill],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      technicalSkills: formData.technicalSkills.filter(skill => skill !== skillToRemove),
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <h1>Gestion des Développeurs</h1>
        <Button variant="contained" onClick={() => handleOpen()}>
          Nouveau Développeur
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matricule</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Poste</TableCell>
              <TableCell>Compétences</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {developers.map((developer) => (
              <TableRow key={developer.id}>
                <TableCell>{developer.employeeId}</TableCell>
                <TableCell>{developer.lastName}</TableCell>
                <TableCell>{developer.firstName}</TableCell>
                <TableCell>{developer.position}</TableCell>
                <TableCell>
                  {developer.technicalSkills.map((skill) => (
                    <Chip key={skill} label={skill} sx={{ m: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(developer)}>Modifier</Button>
                  <Button color="error" onClick={() => handleDelete(developer.id)}>
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingDeveloper ? 'Modifier le développeur' : 'Nouveau développeur'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            
            <TextField
              label="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />

            <TextField
              label="Matricule"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            />

            <TextField
              label="Poste"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />

            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Nouvelle compétence"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button onClick={handleAddSkill}>Ajouter</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.technicalSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDeveloper ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 