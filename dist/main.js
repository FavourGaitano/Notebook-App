"use strict";
document.addEventListener("DOMContentLoaded", function () {
    const addNoteForm = document.querySelector('#form');
    const noteTitle = document.querySelector('#title');
    const noteDesc = document.querySelector('#desc');
    localStorage.setItem('test', 'Hello, world!');
    console.log(localStorage.getItem('test'));
    class NoteActions {
        getNotes() {
            try {
                const notesJson = localStorage.getItem('notes');
                if (notesJson) {
                    return JSON.parse(notesJson);
                }
            }
            catch (error) {
                console.error("Error retrieving notes from localStorage:", error);
            }
            return [];
        }
        saveNotes(notes) {
            try {
                localStorage.setItem('notes', JSON.stringify(notes));
                console.log("Notes saved to localStorage:", notes);
            }
            catch (error) {
                console.error("Error saving notes to localStorage:", error);
            }
        }
        displayNotes() {
            const displayArea = document.querySelector('.general');
            let notes = this.getNotes();
            displayArea.innerHTML = ''; // Clear existing content
            if (notes.length === 0) {
                displayArea.innerHTML = '<p>No notes to display.</p>';
                return;
            }
            notes.forEach((note) => {
                let notePreview = document.createElement('div');
                notePreview.className = 'notePreview';
                notePreview.addEventListener('click', () => {
                    window.location.href = `/view.html?id=${note.id}`;
                });
                let titleElement = document.createElement('h3');
                titleElement.textContent = note.title;
                let descElement = document.createElement('p');
                descElement.textContent = note.desc.length > 100 ? note.desc.substring(0, 97) + '...' : note.desc;
                let deletebtn = document.createElement('button');
                deletebtn.textContent = 'Delete';
                deletebtn.className = 'deletebtn';
                deletebtn.dataset.id = note.id.toString();
                deletebtn.addEventListener('click', () => this.deleteItem(parseInt(deletebtn.dataset.id || '0')));
                // let editbtn = document.createElement('button');
                // editbtn.textContent = 'Update';
                // editbtn.className = 'editbtn';
                // editbtn.dataset.id = note.id.toString();
                // editbtn.addEventListener('click', () => this.editItem(parseInt(editbtn.dataset.id || '0')));
                notePreview.appendChild(titleElement);
                notePreview.appendChild(descElement);
                notePreview.appendChild(deletebtn);
                // notePreview.appendChild(editbtn);
                displayArea.appendChild(notePreview);
            });
        }
        deleteItem(id) {
            let notes = this.getNotes();
            notes = notes.filter(note => note.id !== id);
            this.saveNotes(notes);
            this.displayNotes();
        }
    }
    const noteActions = new NoteActions();
    if (window.location.pathname.endsWith('/create.html')) {
        const addNoteForm = document.querySelector('#form');
        const noteTitle = document.querySelector('#title');
        const noteDesc = document.querySelector('#desc');
        addNoteForm.addEventListener('submit', (e) => {
            console.log("Form submit event triggered.");
            e.preventDefault();
            let notes = noteActions.getNotes();
            let newNote = {
                id: notes.length > 0 ? Math.max(...notes.map(note => note.id)) + 1 : 1,
                title: noteTitle.value.trim(),
                desc: noteDesc.value.trim(),
            };
            notes.push(newNote);
            noteActions.saveNotes(notes);
            console.log("New note added:", newNote);
            noteTitle.value = '';
            noteDesc.value = '';
            window.location.href = '/index.html';
        });
    }
    if (window.location.pathname.includes('/index.html')) {
        noteActions.displayNotes();
    }
});
