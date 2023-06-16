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
                                                <div className="h-2"></div>
                                                <div className={"relative " + size}>
                                                    <div {...provided.dragHandleProps} className={"drag-handle absolute right-10 lg:right-8 top-2 z-10 text-gray-500 hover:text-gray-700"}>
                                                        {/* Icône de poignée */}
                                                        <i className="fas fa-grip-vertical" />
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