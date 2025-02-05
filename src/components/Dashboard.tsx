import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, List, ListItem, ListItemText, Chip, Card, CardContent } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Project, Developer, Assignment } from '../types';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const developersSnapshot = await getDocs(collection(db, 'developers'));
        const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));

        setProjects(projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        setDevelopers(developersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Developer)));
        setAssignments(assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getActiveProjects = () => {
    return projects.filter(p => p.status === 'in_progress');
  };

  const getAvailableDevelopers = () => {
    const currentDate = new Date();
    const assignedDevelopers = assignments
      .filter(a => {
        const endDate = a.endDate ? new Date(a.endDate) : null;
        return a.isIndefinite || (endDate && endDate > currentDate);
      })
      .map(a => ({
        developerId: a.developerId,
        timeAllocation: a.timeAllocation,
      }));

    return developers.map(dev => {
      const totalAllocation = assignedDevelopers
        .filter(a => a.developerId === dev.id)
        .reduce((sum, curr) => sum + curr.timeAllocation, 0);
      
      return {
        ...dev,
        availableTime: 100 - totalAllocation,
      };
    }).filter(dev => dev.availableTime > 0);
  };

  const getRecentAssignments = () => {
    return assignments
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord PMO+
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Projets en cours ({getActiveProjects().length})
            </Typography>
            <List>
              {getActiveProjects().map((project) => (
                <ListItem key={project.id}>
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="h6">{project.name}</Typography>
                      <Typography color="textSecondary">
                        {new Date(project.startDate).toLocaleDateString()} - 
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Non défini'}
                      </Typography>
                      <Typography variant="body2">
                        {project.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={project.type} 
                          color={project.type === 'commercial' ? 'primary' : 'secondary'} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={project.billable ? 'Facturable' : 'Non facturable'} 
                          color={project.billable ? 'success' : 'default'} 
                          size="small" 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Développeurs disponibles ({getAvailableDevelopers().length})
            </Typography>
            <List>
              {getAvailableDevelopers().map((developer) => (
                <ListItem key={developer.id}>
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="h6">
                        {developer.firstName} {developer.lastName}
                      </Typography>
                      <Typography color="textSecondary">
                        {developer.position}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        Disponibilité: {developer.availableTime}%
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {developer.technicalSkills.map((skill) => (
                          <Chip key={skill} label={skill} size="small" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Affectations récentes
            </Typography>
            <List>
              {getRecentAssignments().map((assignment) => (
                <ListItem key={assignment.id}>
                  <ListItemText
                    primary={`${getDeveloperName(assignment.developerId)} → ${getProjectName(assignment.projectId)}`}
                    secondary={`${assignment.timeAllocation}% - Du ${new Date(assignment.startDate).toLocaleDateString()}${
                      assignment.endDate 
                        ? ` au ${new Date(assignment.endDate).toLocaleDateString()}`
                        : ' (durée indéfinie)'
                    }`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 