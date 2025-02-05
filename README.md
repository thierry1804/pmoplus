# PMO+ (Project Management Office Plus)

Application de gestion des affectations de développeurs aux projets.

## Fonctionnalités

- Gestion des projets (commercial/interne)
- Gestion des développeurs et leurs compétences
- Affectation des développeurs aux projets
- Vue des disponibilités
- Diagramme de Gantt des affectations
- Interface intuitive avec glisser-déposer

## Prérequis

- Node.js 18.x ou supérieur
- NPM 9.x ou supérieur
- Un projet Firebase

## Installation

1. Clonez le dépôt :
```bash
git clone <url-du-repo>
cd pmoplus
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez Firebase :
   - Créez un projet sur [Firebase Console](https://console.firebase.google.com)
   - Créez une application Web dans votre projet Firebase
   - Copiez les informations de configuration
   - Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. Démarrez l'application en mode développement :
```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000)

## Structure de la base de données Firebase

### Collection `projects`
- id (auto-généré)
- name (string)
- status (string: analysis, estimation, proposal, negotiation, won, lost, in_progress, completed, abandoned)
- startDate (timestamp)
- endDate (timestamp, optional)
- description (string)
- billable (boolean)
- type (string: commercial/internal)

### Collection `developers`
- id (auto-généré)
- firstName (string)
- lastName (string)
- employeeId (string)
- position (string)
- technicalSkills (array of strings)

### Collection `assignments`
- id (auto-généré)
- developerId (string, référence)
- projectId (string, référence)
- timeAllocation (number: 0-100)
- startDate (timestamp)
- endDate (timestamp, optional)
- isIndefinite (boolean)

## Utilisation

1. **Gestion des projets**
   - Créez et modifiez les projets
   - Suivez leur statut et leur progression
   - Gérez les informations de facturation

2. **Gestion des développeurs**
   - Ajoutez et modifiez les profils des développeurs
   - Gérez leurs compétences techniques
   - Suivez leur disponibilité

3. **Gestion des affectations**
   - Affectez les développeurs aux projets
   - Définissez le pourcentage de temps alloué
   - Utilisez le glisser-déposer pour une gestion intuitive
   - Visualisez les affectations dans un diagramme de Gantt

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT
