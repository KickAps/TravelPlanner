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
            }, key * 1000);
        }
    }

    deleteStep = (id) => {
        const updatedSteps = this.state.steps.filter(step => step.props.id !== id);
        this.setState({ steps: updatedSteps }, () => {
            maps.removeMarkers(id.replace('card_', ''));
            this.updateOrder();
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
                <div className="w-4/5 mx-auto my-2 rounded shadow-lg bg-white">
                    <div className="relative z-10">
                        <button
                            className="absolute top-0 right-0 pt-2 pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => this.deleteStep(`card_${newStepCount}`)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="relative px-3 py-4">
                        <div className="absolute -left-16 top-2 font-bold text-lg text-center px-4 p-2 rounded-full border-2 border-gray-300 bg-white">
                            <span className="step_index">{newStepCount}</span>
                        </div>
                        <form>
                            <div className="flex mb-2">
                                <div className="w-full md:w-1/2 px-3 md:mb-0">
                                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor={`input_${newStepCount}`}>
                                        Lieux
                                    </label>
                                    <input
                                        id={`input_${newStepCount}`}
                                        name={`input_${newStepCount}`}
                                        className="pac-input appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        type="text"
                                        placeholder="Rechercher..."
                                    />
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="date">
                                        Date
                                    </label>
                                    <input
                                        id="date"
                                        type="date"
                                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap mb-2">
                                <div className="w-full px-3">
                                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="description">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        rows="4"
                                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        placeholder="Nous allons...">
                                    </textarea>
                                </div>
                            </div>
                            <div className="flex flex-wrap mb-2">
                                <div className="w-full px-3">
                                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="notes">
                                        Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows="2"
                                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        placeholder="Quelques notes...">
                                    </textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <button
                    className="btn_add block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mx-auto"
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
                }, 1000);
            } else {
                this.updateOrder();
            }
        });
    };

    updateOrder = () => {
        const steps = document.getElementsByClassName('step_index');

        for (let i = 0; i < steps.length; i++) {
            steps[i].textContent = i + 1;
        }
    };

    render() {
        return (
            <div>
                <button
                    className="bg-blue-500 block hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mx-auto"
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