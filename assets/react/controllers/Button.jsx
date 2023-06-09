import React from 'react';

class Button extends React.Component {
    render() {
        const { type, onClick } = this.props;
        let bg_color, bg_color_hover, fa_class;

        switch (type) {
            case "play":
                bg_color = "bg-blue-500";
                bg_color_hover = "bg-blue-700";
                fa_class = "fa-play";
                break;

            case "edit":
                bg_color = "bg-green-500";
                bg_color_hover = "bg-green-700";
                fa_class = "fa-pen";
                break;

            case "delete":
                bg_color = "bg-red-500";
                bg_color_hover = "bg-red-700";
                fa_class = "fa-trash";
                break;
        }

        return (
            <button
                id={type + "_travel"}
                className={bg_color + " hover:" + bg_color_hover + " text-white font-bold rounded mx-auto inline-block w-8 h-8"}
                onClick={onClick}
            >
                <i className={"fa-solid " + fa_class}></i>
            </button >
        );
    }
}

export default Button;
