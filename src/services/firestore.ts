import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  limit,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Project } from '../types';

const COLLECTION_PROJECTS = 'projects';

// Type pour les données Firestore
type FirestoreProjectData = Omit<Project, 'id' | 'startDate' | 'endDate'> & {
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};

export const firestoreService = {
  async getProjects() {
    try {
      // Créer une requête avec une limite et un tri
      const q = query(
        collection(db, COLLECTION_PROJECTS),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      // Exécuter la requête
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('Aucun projet trouvé');
        return [];
      }

      // Mapper les résultats
      const projects = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreProjectData;
        try {
          return {
            id: doc.id,
            name: data.name || '',
            status: data.status || 'analysis',
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            description: data.description || '',
            billable: Boolean(data.billable),
            type: data.type || 'commercial',
          } as Project;
        } catch (error) {
          console.error('Erreur lors du mapping du document:', doc.id, error);
          return null;
        }
      });

      // Filtrer les éventuels projets null
      return projects.filter((project): project is Project => project !== null);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
  },

  async addProject(projectData: Omit<Project, 'id'>) {
    try {
      const firestoreData: FirestoreProjectData = {
        ...projectData,
        startDate: projectData.startDate.toISOString(),
        endDate: projectData.endDate?.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const projectsRef = collection(db, COLLECTION_PROJECTS);
      const docRef = await addDoc(projectsRef, firestoreData);
      console.log('Projet créé avec succès, ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du projet:', error);
      throw new Error('Impossible d\'ajouter le projet');
    }
  },

  async updateProject(projectId: string, projectData: Partial<Project>) {
    try {
      const firestoreData: Partial<FirestoreProjectData> = {
        ...projectData,
        startDate: projectData.startDate?.toISOString(),
        endDate: projectData.endDate?.toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const projectRef = doc(db, COLLECTION_PROJECTS, projectId);
      await updateDoc(projectRef, firestoreData);
      console.log('Projet mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      throw new Error('Impossible de mettre à jour le projet');
    }
  },

  async deleteProject(projectId: string) {
    try {
      const projectRef = doc(db, COLLECTION_PROJECTS, projectId);
      await deleteDoc(projectRef);
      console.log('Projet supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      throw new Error('Impossible de supprimer le projet');
    }
  }
}; 