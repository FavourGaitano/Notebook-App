document.addEventListener("DOMContentLoaded", function () {

    // Define the Note interface
    interface Note {
        id: number;
        title: string;
        desc: string;
        date: string;
    }

    // NoteActions class to handle CRUD operations
    class NoteActions {
        // Retrieve all notes from localStorage
        getNotes(): Note[] {
            try {
                const notesJson = localStorage.getItem('notes');
                if (notesJson) {
                    return JSON.parse(notesJson);
                }
            } catch (error) {
                console.error("Error retrieving notes from localStorage:", error);
            }
            return [];
        }

        // Save notes array to localStorage
        saveNotes(notes: Note[]): void {
            try {
                localStorage.setItem('notes', JSON.stringify(notes));
            } catch (error) {
                console.error("Error saving notes to localStorage:", error);
            }
        }

        // Display all notes on the current page
        displayNotes(): void {
            const displayArea = document.querySelector('.general') as HTMLDivElement;
            if (!displayArea) {
                console.error("Display area not found.");
                return;
            }
            
            let notes = this.getNotes();
            displayArea.innerHTML = '';

            if (notes.length === 0) {
                displayArea.innerHTML = '<p>No notes to display.</p>';
                return;
            }

            notes.forEach((note: Note) => {
                let notePreview = document.createElement('div');
                notePreview.className = 'notePreview';

                notePreview.addEventListener('click', () => {
                    window.location.href = `/view.html?id=${note.id}`;
                });

                let titleElement = document.createElement('h3');
                titleElement.textContent = note.title;
                titleElement.className = 'titleElement';

                let descElement = document.createElement('div');
                descElement.textContent = note.desc;
                descElement.className = 'descElement';

                let dateElement = document.createElement('p');
                dateElement.textContent = `Date: ${note.date}`;
                dateElement.className = 'dateElement';

                let deletebtn = document.createElement('button');
                deletebtn.textContent = 'Delete';
                deletebtn.className = 'deletebtn';
                // Prevent event from bubbling to notePreview
                deletebtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.deleteItem(note.id);
                });

                let editbtn = document.createElement('button');
                editbtn.textContent = 'Edit';
                editbtn.className = 'editbtn';
                // Prevent event from bubbling to notePreview
                editbtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.editItem(note.id);
                });

                notePreview.appendChild(titleElement);
                notePreview.appendChild(descElement);
                notePreview.appendChild(dateElement);
                notePreview.appendChild(deletebtn);
                notePreview.appendChild(editbtn);

                displayArea.appendChild(notePreview);
            });
        }

        // Delete a note by ID
        deleteItem(id: number): void {
            let notes = this.getNotes().filter(note => note.id !== id);
            this.saveNotes(notes);
            this.displayNotes();
        }

        // Redirect to edit page with note details
        editItem(id: number): void {
            const queryParams = `?id=${id}`;
            window.location.href = `UpdateDelete.html${queryParams}`;
        }

        // Update an existing note in the notes array
        updateItem(updatedNote: Note): void {
            let notes = this.getNotes();
            const index = notes.findIndex(note => note.id === updatedNote.id);

            console.log('Entering updateItem function');
            console.log('Current notes:', notes);
            console.log('Index of updated note:', index);

            if (index !== -1) {
                notes[index] = updatedNote;
                this.saveNotes(notes); // Save the updated notes array to local storage
                this.displayNotes();
            } else {
                console.error('Note not found for updating.');
            }
        }

        // Retrieve a single note by ID
        getNoteById(id: number): Note | undefined {
            return this.getNotes().find(note => note.id === id);
        }

        // Handle form submission for note creation
        handleFormSubmission(): void {
            if (window.location.pathname.endsWith('/create.html')) {
                const form = document.querySelector('#form') as HTMLFormElement;
                const titleInput = document.querySelector('#title') as HTMLInputElement;
                const descInput = document.querySelector('#desc') as HTMLInputElement;
                const currentDateInput = document.querySelector('#currentDate') as HTMLInputElement;

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const titleValue = titleInput.value.trim();
                    const descValue = descInput.value.trim();
                    const currentDateValue = currentDateInput.value;

                    if (titleValue === '' || descValue === '' || currentDateValue === '') {
                        alert('Please fill out all fields before submitting the form.');
                        return;
                    }

                    let notes = this.getNotes();
                    const urlParams = new URLSearchParams(window.location.search);
                    const editingId = parseInt(urlParams.get('id') || '0', 10);

                    if (editingId) {
                        // Update existing note
                        const updatedNote: Note = {
                            id: editingId,
                            title: titleValue,
                            desc: descValue,
                            date: currentDateValue,
                        };
                        this.updateItem(updatedNote);
                    } else {
                        // Create a new note
                        const newNote: Note = {
                            id: notes.length > 0 ? Math.max(...notes.map(note => note.id)) + 1 : 1,
                            title: titleValue,
                            desc: descValue,
                            date: currentDateValue,
                        };
                        notes.push(newNote);
                        this.saveNotes(notes);
                        this.displayNotes();
                    }

                    titleInput.value = '';
                    descInput.value = '';
                    currentDateInput.value = '';
                    window.location.href = '/index.html';
                });

                // Set the current date when the page loads
                const currentDate = new Date().toISOString().split('T')[0];
                currentDateInput.value = currentDate;
            }
        }

        // Prefill the form in the edit page
        prefillFormForEdit(id: number): void {
            if (window.location.pathname.endsWith('/UpdateDelete.html')) {
                const noteToEdit = this.getNotes().find(note => note.id === id);
                if (noteToEdit) {
                    const titleInput = document.querySelector('#title') as HTMLInputElement;
                    const descInput = document.querySelector('#desc') as HTMLInputElement;

                    titleInput.value = noteToEdit.title;
                    descInput.value = noteToEdit.desc;
                }
            }
        }

        // Handle form on UpdateDelete.html
        handleUpdateDeleteForm(): void {
            if (window.location.pathname.endsWith('/UpdateDelete.html')) {
                const form = document.querySelector('#form') as HTMLFormElement;
                const titleInput = document.querySelector('#title') as HTMLInputElement;
                const descInput = document.querySelector('#desc') as HTMLInputElement;

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const titleValue = titleInput.value.trim();
                    const descValue = descInput.value.trim();

                    console.log('Form submitted with values:', titleValue, descValue);


                    // Extract note ID from the URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const noteId = parseInt(urlParams.get('id') || '0', 10);

                    

                    if (noteId) {
                        // Create the updated note object
                        const updatedNote: Note = {
                            id: noteId,
                            title: titleValue,
                            desc: descValue,
                            date: new Date().toISOString().split('T')[0],
                            
                        };
                        
                        noteActions.updateItem(updatedNote);

                        
                        titleInput.value = '';
                        descInput.value = '';

                        
                    
                    
                  
                    }
                    
                });
            }
        }
    }

    const noteActions = new NoteActions();

    // Display notes and current date if on index page
    if (window.location.pathname.includes('/index.html')) {
        noteActions.displayNotes();
    }

    // Retrieve and display a single note if on view page
    if (window.location.pathname.includes('/view.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const noteId = parseInt(urlParams.get('id') || '0', 10);
        const note = noteActions.getNoteById(noteId);

        if (note) {
            const noteTitleElement = document.getElementById('noteTitle');
            const noteDescElement = document.getElementById('noteDesc');
            const noteDateElement = document.getElementById('noteDate');

            if (noteTitleElement) {
                noteTitleElement.textContent = note.title;
            }
            if (noteDescElement) {
                noteDescElement.textContent = note.desc;
            }
            if (noteDateElement) {
                noteDateElement.textContent = `Date: ${note.date}`;
            }
        } else {
            const noteContainer = document.getElementById('noteContainer');
            if (noteContainer) {
                noteContainer.innerHTML = '<p>Note not found.</p>';
            }
        }
    }

    // Call the form submission handler
    noteActions.handleFormSubmission();

    // Prefill the form if on the edit page
    if (window.location.pathname.endsWith('/UpdateDelete.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const noteId = parseInt(urlParams.get('id') || '0', 10);
        noteActions.prefillFormForEdit(noteId);
        noteActions.handleUpdateDeleteForm(); // Add this line
    }
});
