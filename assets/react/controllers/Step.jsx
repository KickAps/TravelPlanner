import React from 'react';
import * as maps from '../../js/maps';

class Step extends React.Component {
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
        if (this.state.data.length !== 0) {
            maps.initTravel(this.state.data);
            this.addStep(null, 0, this.state.data);
        }
    }

    deleteStep = (id) => {
        const updatedSteps = this.state.steps.filter(step => step.props.id !== id);
        this.setState({ steps: updatedSteps }, () => {
            // this.updateOrder();
            maps.removeMarkers(id.replace('step_', ''));
            maps.removePath(id, this.order);
        });
    };

    addStep = (event, index = null, data = null) => {
        const newStepCount = this.state.stepCount + 1;

        let insertIndex = index ?? 0;

        // Ajout via clic
        if (event) {
            let target = event.target;
            if (target.tagName === 'I') {
                target = target.parentNode;
            }
            const addButtonElements = document.getElementsByClassName('btn_add_step');
            const addButtonArray = Array.from(addButtonElements);
            insertIndex = addButtonArray.indexOf(target) + 1;
        }

        // Ajout auto - init avec data
        let step_data = null;
        if (data) {
            step_data = data[index];
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
                                    defaultValue={step_data && step_data.place}
                                    className="pac-input appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    type="text"
                                    placeholder="Rechercher..."
                                    form="steps_form"
                                />
                                <input
                                    id={`lat_${newStepCount}`}
                                    name={`lat_${newStepCount}`}
                                    defaultValue={step_data && step_data.lat}
                                    type="hidden"
                                    form="steps_form"
                                />
                                <input
                                    id={`lng_${newStepCount}`}
                                    name={`lng_${newStepCount}`}
                                    defaultValue={step_data && step_data.lng}
                                    type="hidden"
                                    form="steps_form"
                                />
                                <input
                                    id={`url_${newStepCount}`}
                                    name={`url_${newStepCount}`}
                                    defaultValue={step_data && step_data.url}
                                    type="hidden"
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
                                    defaultValue={step_data && step_data.desc}
                                    rows="4"
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    placeholder="Nous allons..."
                                    form="steps_form"
                                >
                                </textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    className="btn_add_step block bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded mx-auto"
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
            // this.updateOrder();
            maps.initInputSearch(newStepCount, insertIndex, this.order);

            index++;
            if (data && index < data.length) {
                // Appel récursif tant qu'il y a des étapes à afficher
                this.addStep(null, index, data);
            }
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

        // updateOrder

        const form = e.target;
        const formData = new FormData(form);
        formData.append('order', JSON.stringify(this.order));

        const formJson = Object.fromEntries(formData.entries());

        fetch(window.location.origin + '/edit_travel', {
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

export default Step;