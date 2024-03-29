export function showSaved() {
    document.getElementById("saved_icon").classList.remove('hidden');
    document.getElementById("unsaved_icon").classList.add('hidden');
}

export function showUnsaved() {
    document.getElementById("saved_icon").classList.add('hidden');
    document.getElementById("unsaved_icon").classList.remove('hidden');
}

export function getPercentage(current, max, sign = false) {
    let value = Math.round(current * 100 / max);
    if (sign) {
        return value + "%"
    } else {
        return value;
    }
}

export function formatEuro(value) {
    return value + " €";
};

window.addEventListener('load', function () {
    const dropdown_btn = document.getElementById("dropdown_btn");
    const dropdown_menu = document.getElementById("dropdown_menu");
    const dropdown_close = document.getElementById("dropdown_close");

    if (dropdown_btn && dropdown_close && dropdown_menu) {
        dropdown_btn.addEventListener('click', function () {
            if (dropdown_menu.classList.contains("hidden")) {
                dropdown_menu.classList.remove("hidden");
                dropdown_close.classList.remove("hidden");
            } else {
                dropdown_menu.classList.add("hidden");
                dropdown_close.classList.add("hidden");
            }
        });

        dropdown_close.addEventListener('click', function () {
            dropdown_menu.classList.add("hidden");
            dropdown_close.classList.add("hidden");
        });
    }
});