export function showSaved() {
    document.getElementById("saved_icon").classList.remove('hidden');
    document.getElementById("unsaved_icon").classList.add('hidden');
}

export function showUnsaved() {
    document.getElementById("saved_icon").classList.add('hidden');
    document.getElementById("unsaved_icon").classList.remove('hidden');
}