import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

class DrapDrop extends React.Component {
    render() {
        const { data, onDragEnd, size } = this.props;

        return (
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
                                                <div className={"p-2 relative " + size}>
                                                    <div {...provided.dragHandleProps} className={"drag-handle absolute right-20 lg:right-12 top-3 z-10 text-5xl lg:text-2xl text-gray-500 hover:text-gray-700"}>
                                                        {/* Icône de poignée */}
                                                        <i className="fas fa-grip-lines" />
                                                    </div>
                                                    {item.content}
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
        );
    }
}

export default DrapDrop;