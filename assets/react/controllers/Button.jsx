import React from 'react';

class Button extends React.Component {
    render() {
        const { name, onClick } = this.props;
        let bg_color, bg_color_hover, fa_class, label = "";

        switch (name) {
            case "play":
                bg_color = "bg-blue-500";
                bg_color_hover = "hover:bg-blue-700";
                fa_class = "fa-play";
                label = "Lancer";
                break;

            case "edit":
                bg_color = "bg-green-500";
                bg_color_hover = "hover:bg-green-700";
                fa_class = "fa-pen";
                label = "Modifier";
                break;

            case "budget":
                bg_color = "bg-yellow-500";
                bg_color_hover = "hover:bg-yellow-700";
                fa_class = "fa-sack-dollar";
                label = "Budget";
                break;

            case "delete":
                bg_color = "bg-red-500";
                bg_color_hover = "hover:bg-red-700";
                fa_class = "fa-trash";
                label = "Supprimer";
                break;

            case "plus":
                bg_color = "bg-blue-500";
                bg_color_hover = "hover:bg-blue-700";
                fa_class = "fa-plus";
                break;
        }

        return (
            <button
                id={name + "_travel"}
                type="button"
                className={bg_color + " " + bg_color_hover + " text-white font-bold rounded-lg lg:rounded mx-auto block px-3 py-1"}
                onClick={onClick}
            >
                {label && (
                    <span className="mr-2">{label}</span>
                )}
                <i className={"fa-solid " + fa_class}></i>
            </button >
        );
    }
}

export default Button;
