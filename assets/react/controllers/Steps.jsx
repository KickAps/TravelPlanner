import React from 'react';
import * as maps from '../../js/maps';

class Steps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            steps: [],
            stepCount: 0,
            data: props.data || [],
        };
    }

    componentDidMount() {
        for (const [key, value] of Object.entries(this.state.data)) {
            setTimeout(() => {
                this.addStep(null, key, value.place);
            }, key * 500);
        }
    }

    deleteStep = (id) => {
        const updatedSteps = this.state.steps.filter(step => step.props.id !== id);
        this.setState({ steps: updatedSteps }, () => {
            maps.removeMarkers(id.replace('card_', ''));
        });
    };

    addStep = (event, index, place) => {
        const newStepCount = this.state.stepCount + 1;

        let insertIndex = index ?? 0;

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
                    onClick={this.addStep}
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>
        );

        const updatedSteps = [...this.state.steps];
        updatedSteps.splice(insertIndex, 0, newStep);

        this.setState(prevState => ({
            steps: updatedSteps,
            stepCount: newStepCount,
        }), () => {
            maps.initInputSearch(newStepCount, insertIndex);

            if (place) {
                const inputs = document.getElementsByClassName("pac-input");
                let input = inputs[insertIndex];
                setTimeout(() => {
                    input.value = place;
                    google.maps.event.trigger(input, 'focus', {});
                    google.maps.event.trigger(input, 'keydown', { keyCode: 13 });
                }, 500);
            }
        });
    };

    render() {
        return (
            <div>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={this.addStep}
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
                {this.state.steps.map(step => step)}
            </div>
        );
    }
}

export default Steps;