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
  Slider,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Assignment, Developer, Project } from '../types';

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    developerId: '',
    projectId: '',
    timeAllocation: 100,
    startDate: new Date(),
    endDate: null as Date | null,
    isIndefinite: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsSnap, developersSnap, projectsSnap] = await Promise.all([
        getDocs(collection(db, 'assignments')),
        getDocs(collection(db, 'developers')),
        getDocs(collection(db, 'projects')),
      ]);

      setAssignments(assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
      setDevelopers(developersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Developer)));
      setProjects(projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleOpen = (assignment?: Assignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        developerId: assignment.developerId,
        projectId: assignment.projectId,
        timeAllocation: assignment.timeAllocation,
        startDate: new Date(assignment.startDate),
        endDate: assignment.endDate ? new Date(assignment.endDate) : null,
        isIndefinite: assignment.isIndefinite,
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        developerId: '',
        projectId: '',
        timeAllocation: 100,
        startDate: new Date(),
        endDate: null,
        isIndefinite: false,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAssignment(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAssignment) {
        await updateDoc(doc(db, 'assignments', editingAssignment.id), formData);
      } else {
        await addDoc(collection(db, 'assignments'), formData);
      }
      handleClose();
      fetchData();
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    try {
      await deleteDoc(doc(db, 'assignments', assignmentId));
      fetchData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    try {
      const assignment = assignments.find(a => a.id === draggableId);
      if (!assignment) return;

      await updateDoc(doc(db, 'assignments', draggableId), {
        projectId: destination.droppableId,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const getDeveloperName = (developerId: string) => {
    const developer = developers.find(d => d.id === developerId);
    return developer ? `${developer.firstName} ${developer.lastName}` : 'Unknown';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <h1>Gestion des Affectations</h1>
        <Button variant="contained" onClick={() => handleOpen()}>
          Nouvelle Affectation
        </Button>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {projects.map((project) => (
            <Droppable key={project.id} droppableId={project.id}>
              {(provided) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ p: 2, minWidth: 300, minHeight: 200 }}
                >
                  <h3>{project.name}</h3>
                  {assignments
                    .filter((a) => a.projectId === project.id)
                    .map((assignment, index) => (
                      <Draggable
                        key={assignment.id}
                        draggableId={assignment.id}
                        index={index}
                      >
                        {(provided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ p: 1, mb: 1 }}
                          >
                            <Box>
                              <strong>{getDeveloperName(assignment.developerId)}</strong>
                              <br />
                              {assignment.timeAllocation}% - {new Date(assignment.startDate).toLocaleDateString()}
                              {assignment.endDate && ` to ${new Date(assignment.endDate).toLocaleDateString()}`}
                              <Button
                                size="small"
                                onClick={() => handleOpen(assignment)}
                                sx={{ ml: 1 }}
                              >
                                Edit
                              </Button>
                            </Box>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </Paper>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingAssignment ? 'Modifier l\'affectation' : 'Nouvelle affectation'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl>
              <InputLabel>Développeur</InputLabel>
              <Select
                value={formData.developerId}
                onChange={(e) => setFormData({ ...formData, developerId: e.target.value })}
              >
                {developers.map((developer) => (
                  <MenuItem key={developer.id} value={developer.id}>
                    {developer.firstName} {developer.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel>Projet</InputLabel>
              <Select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <InputLabel>Allocation de temps (%)</InputLabel>
              <Slider
                value={formData.timeAllocation}
                onChange={(_, value) => setFormData({ ...formData, timeAllocation: value as number })}
                min={0}
                max={100}
                step={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <DatePicker
              label="Date de début"
              value={formData.startDate}
              onChange={(newValue) => setFormData({ ...formData, startDate: newValue || new Date() })}
              slotProps={{ textField: { fullWidth: true } }}
            />

            {!formData.isIndefinite && (
              <DatePicker
                label="Date de fin"
                value={formData.endDate}
                onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            )}

            <FormControl>
              <InputLabel>Durée indéfinie</InputLabel>
              <Select
                value={formData.isIndefinite}
                onChange={(e) => setFormData({ ...formData, isIndefinite: e.target.value === 'true' })}
              >
                <MenuItem value="false">Non</MenuItem>
                <MenuItem value="true">Oui</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAssignment ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 