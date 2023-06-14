import React from 'react';
import * as maps from '../../js/maps';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
        const updatedSteps = this.state.steps.filter(step => step.id !== id);
        this.setState({ steps: updatedSteps }, () => {
            maps.removeMarkers(id.replace('step_', ''));
            maps.removePath(id, this.order);
        });
    };

    onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const steps = [...this.state.steps];
        const [removed] = steps.splice(result.source.index, 1);
        steps.splice(result.destination.index, 0, removed);

        this.setState({ steps });
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

        const id = "step_" + newStepCount;

        const content = (
            <div id={id} className="step">
                <div className="w-11/12 mx-auto rounded shadow bg-white">
                    <div className="relative z-10">
                        <button
                            className="absolute top-0 right-0 pt-2 pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => this.deleteStep(id)}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>

                    <div className="relative px-3 py-4">
                        <div className="flex mb-2">
                            <div className="w-full px-3 md:mb-0">
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
            </div>
        );

        const newStep = {
            id: id,
            content: content,
        };

        const updatedSteps = [...this.state.steps];
        updatedSteps.splice(insertIndex, 0, newStep);

        this.setState(prevState => ({
            steps: updatedSteps,
            stepCount: newStepCount,
        }), () => {
            maps.initInputSearch(newStepCount, insertIndex, this.order);

            index++;
            if (data && index < data.length) {
                // Appel récursif tant qu'il y a des étapes à afficher
                this.addStep(null, index, data);
            }
        });
    }
    render() {
        return (
            <div>
                <DragDropContext onDragEnd={this.onDragEnd} droppableId="group-input">
                    <Droppable droppableId="droppable-input">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                <ul>
                                    {this.state.steps.map((step, index) => (
                                        <Draggable key={step.id} draggableId={step.id.toString()} index={index}>
                                            {(provided) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="draggable-item"
                                                >
                                                    <div className="h-2"></div>
                                                    <div className="relative">
                                                        <div {...provided.dragHandleProps} className="drag-handle absolute right-16 top-2 z-10 text-gray-500 hover:text-gray-700">
                                                            {/* Icône de poignée */}
                                                            <i className="fas fa-grip-vertical" />
                                                        </div>
                                                        {step.content}
                                                    </div>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                </ul>
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext >
                <button
                    type="button"
                    className="bg-blue-500 block hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mx-auto mt-2"
                    onClick={this.addStep}
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>
        );
    }
}

export default Step;