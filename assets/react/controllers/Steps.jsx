import React from 'react';
import * as maps from '../../js/maps';

class Steps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            divs: [],
            stepCount: 0,
        };
    }

    componentDidMount() {
        this.addDiv();
    }

    deleteStep = (id) => {
        const updatedDivs = this.state.divs.filter(div => div.props.id !== id);
        this.setState({ divs: updatedDivs }, () => {
            maps.removeMarkers(id.replace('card_', ''));
        });
    };

    addDiv = (event) => {
        const newStepCount = this.state.stepCount + 1;

        let insertIndex = 0;

        if (event) {
            let target = event.target;
            if (target.tagName === 'I') {
                target = target.parentNode;
            }
            const addButtonElements = document.getElementsByClassName('btn_add');
            const addButtonArray = Array.from(addButtonElements);
            insertIndex = addButtonArray.indexOf(target) + 1;
        }

        const newStep = (
            <div key={newStepCount} id={`card_${newStepCount}`}>
                <div className="max-w-sm rounded overflow-hidden shadow-lg">
                    <div>
                        <button
                            className="relative top-0 right-0 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => this.deleteStep(`card_${newStepCount}`)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="px-6 py-2">
                        <div className="font-bold text-xl mb-2">
                            <span>Étape </span>
                            <span className="step_index">{newStepCount}</span>
                        </div>
                        <input
                            id={`input_${newStepCount}`}
                            name={`input_${newStepCount}`}
                            className="controls pac-input"
                            type="text"
                            placeholder="Rechercher..."
                        />
                    </div>
                </div>
                <button
                    className="btn_add bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={this.addDiv}
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>
        );

        const updatedDivs = [...this.state.divs];
        updatedDivs.splice(insertIndex, 0, newStep);

        this.setState(prevState => ({
            divs: updatedDivs,
            stepCount: newStepCount,
        }), () => {
            maps.initInputSearch(newStepCount, insertIndex);
        });
    };

    render() {
        return (
            <div>
                {this.state.divs.map(div => div)}
            </div>
        );
    }
}

export default Steps;