import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

class DrapDrop extends React.Component {
    render() {
        const { data, onDragEnd, size, edit } = this.props;

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
                                                <div className={"p-2 relative " + size}>
                                                    <div {...provided.dragHandleProps} className={"drag-handle absolute right-20 lg:right-14 top-3 z-10 text-5xl lg:text-2xl text-gray-500 hover:text-gray-700"}>
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
        ) : (
            <div>
                {data.map((item, index) => (
                    <div key={item.id} index={index} className={"p-2 relative " + size}>
                        {item.content}
                    </div>
                ))}
            </div>
        ));
    }
}

export default DrapDrop;