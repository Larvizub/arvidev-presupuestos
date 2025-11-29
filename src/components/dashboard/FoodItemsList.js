import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaRegSquare, FaCheckSquare } from 'react-icons/fa';
import { useCurrency } from '../../contexts/CurrencyContext';

const Container = styled.div`
  margin-top: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #e2e8f0;
`;

const Title = styled.h4`
  font-size: 1rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ItemRow = styled.li`
  display: grid;
  grid-template-columns: 0.5fr 3fr 1fr 2fr 1fr;
  gap: 10px;
  margin-bottom: 8px;
  align-items: center;
  padding: 8px;
  background-color: ${props => props.editing ? '#f0f7ff' : (props.isPaid ? '#f0fff4' : 'white')};
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s;
  border-left: 3px solid ${props => props.isPaid ? '#2ecc71' : 'transparent'};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemName = styled.div`
  font-size: 0.9rem;
  color: #2c3e50;
`;

const ItemQuantity = styled.div`
  font-size: 0.9rem;
  color: #2c3e50;
  text-align: center;
`;

const ItemPrice = styled.div`
  font-size: 0.9rem;
  color: #2c3e50;
  text-align: right;
`;

const ItemAction = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const Button = styled.button`
  background-color: ${props => {
    if (props.primary) return '#3498db';
    if (props.danger) return '#e74c3c';
    if (props.success) return '#2ecc71';
    return '#f8fafc';
  }};
  color: ${props => (props.primary || props.danger || props.success) ? 'white' : '#64748b'};
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => {
      if (props.primary) return '#2980b9';
      if (props.danger) return '#c0392b';
      if (props.success) return '#27ae60';
      return '#e2e8f0';
    }};
  }
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  font-weight: bold;
`;

const ItemCheckbox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${props => props.isPaid ? '#2ecc71' : '#cbd5e1'};
  font-size: 1.1rem;
  
  &:hover {
    color: ${props => props.isPaid ? '#27ae60' : '#94a3b8'};
  }
`;

const FoodItemsList = ({ items = [], onChange }) => {
  const { formatCurrency } = useCurrency();
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, price: '', isPaid: false });
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});
  
  const handleAddItem = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!newItem.name || !newItem.price) return;
    
    const newItemData = {
      ...newItem,
      id: Date.now().toString(),
      quantity: Number(newItem.quantity),
      price: Number(newItem.price),
      isPaid: false
    };
    
    const currentItems = Array.isArray(items) ? [...items] : [];
    const updatedItems = [...currentItems, newItemData];
    
    if (typeof onChange === 'function') {
      onChange(updatedItems);
    }
    
    setNewItem({ name: '', quantity: 1, price: '', isPaid: false });
  };
  
  const handleRemoveItem = (id) => {
    const currentItems = Array.isArray(items) ? [...items] : [];
    const updatedItems = currentItems.filter(item => item.id !== id);
    
    if (typeof onChange === 'function') {
      onChange(updatedItems);
    }
  };
  
  const toggleItemPaid = (id) => {
    const currentItems = Array.isArray(items) ? [...items] : [];
    const updatedItems = currentItems.map(item => 
      item.id === id ? { ...item, isPaid: !item.isPaid } : item
    );
    
    if (typeof onChange === 'function') {
      onChange(updatedItems);
    }
  };
  
  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditValues({ ...item });
  };
  
  const cancelEditing = () => {
    setEditingItem(null);
    setEditValues({});
  };
  
  const saveEdit = (id) => {
    if (!editValues.name || !editValues.price) return;
    
    const currentItems = Array.isArray(items) ? [...items] : [];
    const updatedItems = currentItems.map(item => 
      item.id === id ? { 
        ...item, 
        name: editValues.name,
        quantity: Number(editValues.quantity),
        price: Number(editValues.price),
        isPaid: Boolean(editValues.isPaid)
      } : item
    );
    
    if (typeof onChange === 'function') {
      onChange(updatedItems);
    }
    
    setEditingItem(null);
    setEditValues({});
  };
  
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditValues({
      ...editValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleToggleEditPaid = () => {
    setEditValues({
      ...editValues,
      isPaid: !editValues.isPaid
    });
  };
  
  const handleNewItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem({
      ...newItem,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const totalAmount = (Array.isArray(items) ? items : []).reduce((sum, item) => {
    if (!item.isPaid) {
      return sum + (Number(item.quantity) * Number(item.price));
    }
    return sum;
  }, 0);
  
  const paidAmount = (Array.isArray(items) ? items : []).reduce((sum, item) => {
    if (item.isPaid) {
      return sum + (Number(item.quantity) * Number(item.price));
    }
    return sum;
  }, 0);
  
  const safeItems = Array.isArray(items) ? items : [];
  
  return (
    <Container>
      <Title>Artículos de Alimentación</Title>
      
      {safeItems.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Añade artículos a tu compra para desglosar el gasto.
        </p>
      ) : (
        <ItemsList>
          {safeItems.map(item => (
            <ItemRow key={item.id} editing={editingItem === item.id} isPaid={item.isPaid}>
              {editingItem === item.id ? (
                <>
                  <ItemCheckbox 
                    isPaid={editValues.isPaid} 
                    onClick={handleToggleEditPaid}
                  >
                    {editValues.isPaid ? <FaCheckSquare /> : <FaRegSquare />}
                  </ItemCheckbox>
                  
                  <Input
                    name="name"
                    value={editValues.name}
                    onChange={handleEditChange}
                    placeholder="Nombre del artículo"
                  />
                  <Input
                    name="quantity"
                    type="number"
                    value={editValues.quantity}
                    onChange={handleEditChange}
                    min="1"
                    step="1"
                  />
                  <Input
                    name="price"
                    type="number"
                    value={editValues.price}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                  />
                  <ItemAction>
                    <Button danger onClick={cancelEditing}>
                      <FaTimes />
                    </Button>
                    <Button success onClick={() => saveEdit(item.id)}>
                      <FaSave />
                    </Button>
                  </ItemAction>
                </>
              ) : (
                <>
                  <ItemCheckbox 
                    isPaid={item.isPaid} 
                    onClick={() => toggleItemPaid(item.id)}
                  >
                    {item.isPaid ? <FaCheckSquare /> : <FaRegSquare />}
                  </ItemCheckbox>
                  
                  <ItemName>{item.name}</ItemName>
                  <ItemQuantity>x{item.quantity}</ItemQuantity>
                  <ItemPrice>{formatCurrency(item.quantity * item.price)}</ItemPrice>
                  <ItemAction>
                    <Button onClick={() => startEditing(item)}>
                      <FaEdit />
                    </Button>
                    <Button danger onClick={() => handleRemoveItem(item.id)}>
                      <FaTrash />
                    </Button>
                  </ItemAction>
                </>
              )}
            </ItemRow>
          ))}
        </ItemsList>
      )}
      
      <div className="add-item-container" style={{ 
        display: 'grid',
        gridTemplateColumns: '0.5fr 3fr 1fr 2fr 1fr',
        gap: '10px',
        marginTop: '15px',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <FaPlus style={{ color: '#3498db' }} />
        </div>
        <Input
          name="name"
          value={newItem.name}
          onChange={handleNewItemChange}
          placeholder="Nombre del artículo"
        />
        <Input
          name="quantity"
          type="number"
          value={newItem.quantity}
          onChange={handleNewItemChange}
          min="1"
          step="1"
        />
        <Input
          name="price"
          type="number"
          value={newItem.price}
          onChange={handleNewItemChange}
          placeholder="Precio unitario"
          min="0"
          step="0.01"
        />
        <Button 
          primary 
          type="button"
          onClick={(e) => {
            if (newItem.name && newItem.price) {
              handleAddItem(e);
            }
          }}
        >
          <FaPlus />
        </Button>
      </div>
      
      <TotalRow>
        <div>
          <span>Total por pagar:</span>
          <span style={{ marginLeft: '10px', color: '#e74c3c', fontWeight: 'bold' }}>{formatCurrency(totalAmount)}</span>
        </div>
        <div>
          <span>Pagado:</span>
          <span style={{ marginLeft: '10px', color: '#2ecc71' }}>{formatCurrency(paidAmount)}</span>
        </div>
      </TotalRow>
      
      <div style={{ 
        marginTop: '10px', 
        fontSize: '0.85rem', 
        color: '#64748b',
        fontStyle: 'italic',
        textAlign: 'center'
      }}>
        Añade tus artículos y cuando termines, guarda la transacción
      </div>
    </Container>
  );
};

export default React.memo(FoodItemsList);
