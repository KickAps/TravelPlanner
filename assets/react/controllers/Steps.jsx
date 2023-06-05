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
        this.order = {};
    }

    componentDidMount() {
        for (const [key, data] of Object.entries(this.state.data)) {
            setTimeout(() => {
                this.addStep(null, key, data);
            }, key * 1000);
        }
    }

    deleteStep = (id) => {
        const updatedSteps = this.state.steps.filter(step => step.props.id !== id);
        this.setState({ steps: updatedSteps }, () => {
            maps.removeMarkers(id.replace('step_', ''));
            this.updateOrder();
        });
    };

    addStep = (event, index, data = null) => {
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
            <div key={newStepCount} id={`step_${newStepCount}`} className="step">
                <div className="w-4/5 mx-auto my-2 rounded shadow-lg bg-white">
                    <div className="relative z-10">
                        <button
                            className="absolute top-0 right-0 pt-2 pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => this.deleteStep(`step_${newStepCount}`)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="relative px-3 py-4">
                        <div className="absolute -left-16 top-2 font-bold text-lg text-center px-4 p-2 rounded-full border-2 border-gray-300 bg-white">
                            <span className="step_order">{newStepCount}</span>
                        </div>
                        <div className="flex mb-2">
                            <div className="w-full md:w-1/2 px-3 md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor={`place_${newStepCount}`}>
                                    Lieux
                                </label>
                                <input
                                    id={`place_${newStepCount}`}
                                    name={`place_${newStepCount}`}
                                    className="pac-input appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    type="text"
                                    placeholder="Rechercher..."
                                    form="steps_form"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="date">
                                    Date
                                </label>
                                <input
                                    id="date"
                                    name={`date_${newStepCount}`}
                                    defaultValue={data && data.date}
                                    type="date"
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    form="steps_form"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap mb-2">
                            <div className="w-full px-3">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="desc">
                                    Description
                                </label>
                                <textarea
                                    id="desc"
                                    name={`desc_${newStepCount}`}
                                    defaultValue={data && data.desc}
                                    rows="4"
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    placeholder="Nous allons..."
                                    form="steps_form"
                                >
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
                                    name={`notes_${newStepCount}`}
                                    defaultValue={data && data.notes}
                                    rows="2"
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    placeholder="Quelques notes..."
                                    form="steps_form"
                                >
                                </textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
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

            if (data) {
                const inputs = document.getElementsByClassName("pac-input");
                let input = inputs[insertIndex];
                setTimeout(() => {
                    input.value = data.place;
                    google.maps.event.trigger(input, 'focus', {});
                    google.maps.event.trigger(input, 'keydown', { keyCode: 13 });
                }, 1000);
            }

            this.updateOrder();
        });
    }

    updateOrder = () => {
        const steps_order = document.getElementsByClassName('step_order');
        const steps = document.getElementsByClassName('step');

        this.order = {};

        for (let i = 0; i < steps.length; i++) {
            steps_order[i].textContent = i + 1;
            this.order[i] = steps[i].id;
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        formData.append('order', JSON.stringify(this.order));

        const formJson = Object.fromEntries(formData.entries());

        fetch(window.location.origin + '/new_travel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formJson),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la requête.');
                }
                return response.json();
            })
            .then(data => {
                // Traiter la réponse si nécessaire
                console.log(data);
            })
            .catch(error => {
                // Gérer les erreurs de la requête
                console.error(error);
            });
    };

    render() {
        return (
            <div>
                <button
                    className="bg-blue-500 block hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mx-auto mt-2"
                    onClick={this.addStep}
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
                <form id="steps_form" onSubmit={this.handleSubmit}>
                    {this.state.steps.map(step => step)}
                </form>
            </div>
        );
    }
}

export default Steps;