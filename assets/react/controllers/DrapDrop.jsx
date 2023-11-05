import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Checkbox } from "primereact/checkbox";

class DrapDrop extends React.Component {
    render() {
        const { data, onDragEnd, size, edit, checkbox, setHomeCheck } = this.props;

        return (edit ? (
            <DragDropContext onDragEnd={onDragEnd} droppableId="group-input">
                <Droppable droppableId="droppable-input">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            <div>
                                {data.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="draggable-item"
                                            >
                                                <div className={"relative " + size}>
                                                    <div {...provided.dragHandleProps} className={"drag-handle absolute right-20 lg:right-14 top-5 lg:top-3 z-10 text-5xl lg:text-2xl text-gray-500 hover:text-gray-700"}>
                                                        {/* Icône de poignée */}
                                                        <i className="fas fa-grip-lines" />
                                                    </div>
                                                    {item.content}
                                                    {checkbox &&
                                                        <div className="absolute bottom-2 left-3">
                                                            <div className="flex flex-wrap">
                                                                <Checkbox
                                                                    inputId={item.homeCheck.id}
                                                                    name={item.homeCheck.id}
                                                                    onChange={(e) => setHomeCheck(e, item.id)}
                                                                    checked={item.homeCheck.checked}
                                                                    disabled={item.homeCheck.disabled}
                                                                />
                                                                <label
                                                                    htmlFor={item.homeCheck.id}
                                                                    style={{ marginTop: "1px" }}
                                                                    className={item.homeCheck.disabled ? "ml-2 text-gray-500 select-none" : "ml-2 text-gray-700 select-none cursor-pointer"}
                                                                >Définir comme logement</label>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext >
        ) : (
            <div>
                {data.map((item, index) => (
                    <div key={item.id} index={index} className={"relative " + size}>
                        {item.content}
                    </div>
                ))}
            </div>
        ));
    }
}

export default DrapDrop;