import React, { useState, useEffect } from 'react';
import { Calendar, Car, Heart, CreditCard, Gauge, Users, Plus, Bell, X, Edit2, Trash2, AlertCircle } from 'lucide-react';

const InsuranceTracker = () => {

  const handleExport = () => {
    const data = {
      events,
      customEventTypes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'insurance-data.json';
    link.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result as string);
        if (data.events) setEvents(data.events);
        if (data.customEventTypes) setCustomEventTypes(data.customEventTypes);
      } catch (err) {
        alert('Fișier invalid!');
      }
    };
    reader.readAsText(file);
  };
  const [events, setEvents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [customEventTypes, setCustomEventTypes] = useState([]);
  const [showCustomEventForm, setShowCustomEventForm] = useState(false);
  const [newCustomEventType, setNewCustomEventType] = useState({
    key: '',
    label: '',
    icon: 'AlertCircle',
    color: 'blue'
  });

  const predefinedEventTypes = {
    car_insurance: { label: 'Asigurare auto', icon: Car, color: 'blue' },
    life_insurance: { label: 'Asigurare viață', icon: Heart, color: 'red' },
    vignette: { label: 'Rovinietă', icon: CreditCard, color: 'green' },
    meter_reading: { label: 'Citire contor', icon: Gauge, color: 'purple' },
    name_day: { label: 'Zi onomastică', icon: Users, color: 'orange' }
  };

  const iconOptions = {
    AlertCircle: AlertCircle,
    Car: Car,
    Heart: Heart,
    CreditCard: CreditCard,
    Gauge: Gauge,
    Users: Users,
    Calendar: Calendar,
    Bell: Bell
  };

  const colorOptions = ['blue', 'red', 'green', 'purple', 'orange', 'yellow', 'pink', 'indigo'];

  // Combină tipurile predefinite cu cele personalizate
  const eventTypes = {
    ...predefinedEventTypes,
    ...customEventTypes.reduce((acc, type) => {
      acc[type.key] = type;
      return acc;
    }, {})
  };

  const [newEvent, setNewEvent] = useState({
    type: 'car_insurance',
    title: '',
    date: '',
    expirationDate: '',
    description: '',
    notifyDays: 7,
    recurring: false,
    recurringType: 'yearly',
    useExpirationDate: false
  });

  // Calculează notificările
  useEffect(() => {
    const today = new Date();
    const upcomingNotifications = [];

    events.forEach(event => {
      const eventDate = new Date(event.finalDate || event.date);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= event.notifyDays && diffDays >= 0) {
        upcomingNotifications.push({
          ...event,
          daysUntil: diffDays
        });
      }
    });

    setNotifications(upcomingNotifications);
  }, [events]);

  const addCustomEventType = () => {
    if (newCustomEventType.key && newCustomEventType.label) {
      const customType = {
        ...newCustomEventType,
        key: newCustomEventType.key.toLowerCase().replace(/\s+/g, '_'),
        icon: iconOptions[newCustomEventType.icon]
      };
      setCustomEventTypes([...customEventTypes, customType]);
      setNewCustomEventType({
        key: '',
        label: '',
        icon: 'AlertCircle',
        color: 'blue'
      });
      setShowCustomEventForm(false);
    }
  };

  const deleteCustomEventType = (key) => {
    setCustomEventTypes(customEventTypes.filter(type => type.key !== key));
    // Șterge și evenimentele de acest tip
    setEvents(events.filter(event => event.type !== key));
  };

  const addEvent = () => {
    if (newEvent.title && (newEvent.date || newEvent.expirationDate)) {
      const event = {
        ...newEvent,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        finalDate: newEvent.useExpirationDate ? newEvent.expirationDate : newEvent.date
      };
      setEvents([...events, event]);
      resetForm();
    }
  };

  const updateEvent = () => {
    if (newEvent.title && (newEvent.date || newEvent.expirationDate)) {
      const updatedEvent = {
        ...newEvent,
        id: editingEvent.id,
        finalDate: newEvent.useExpirationDate ? newEvent.expirationDate : newEvent.date
      };
      setEvents(events.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      ));
      resetForm();
    }
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const editEvent = (event) => {
    setNewEvent(event);
    setEditingEvent(event);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setNewEvent({
      type: 'car_insurance',
      title: '',
      date: '',
      expirationDate: '',
      description: '',
      notifyDays: 7,
      recurring: false,
      recurringType: 'yearly',
      useExpirationDate: false
    });
    setShowAddForm(false);
    setEditingEvent(null);
  };

  const getDaysUntilEvent = (event) => {
    const today = new Date();
    const eventDate = new Date(event.finalDate || event.date);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (daysUntil) => {
    if (daysUntil < 0) return 'text-red-600';
    if (daysUntil <= 7) return 'text-orange-600';
    if (daysUntil <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredEvents = activeTab === 'all' 
    ? events 
    : events.filter(event => event.type === activeTab);

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.finalDate || a.date).getTime() - new Date(b.finalDate || b.date).getTime());

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="text-blue-600" size={32} />
            Evidența Asigurărilor și Evenimente
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Adaugă eveniment
            </button>
            <button
              onClick={() => setShowCustomEventForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Tip eveniment nou
            </button>
          
          <button
            onClick={handleExport}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
          >
            Exportă date
          </button>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-300"
          />
</div>
        </div>

        {/* Notificări */}
        {notifications.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-orange-800 flex items-center gap-2 mb-3">
              <Bell size={20} />
              Notificări urgente ({notifications.length})
            </h2>
            <div className="space-y-2">
              {notifications.map(notification => {
                const IconComponent = eventTypes[notification.type].icon;
                return (
                  <div key={notification.id} className="flex items-center gap-3 text-orange-800">
                    <IconComponent size={16} />
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-sm">
                      {notification.daysUntil === 0 ? 'Astăzi!' : `în ${notification.daysUntil} zile`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tipuri de evenimente personalizate */}
        {customEventTypes.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-3">
              Tipuri de evenimente personalizate
            </h2>
            <div className="flex flex-wrap gap-2">
              {customEventTypes.map(type => {
                const IconComponent = type.icon;
                return (
                  <div key={type.key} className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border">
                    <IconComponent size={16} className={`text-${type.color}-600`} />
                    <span className="text-sm font-medium">{type.label}</span>
                    <button
                      onClick={() => deleteCustomEventType(type.key)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtre */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Toate ({events.length})
          </button>
          {Object.entries(eventTypes).map(([key, type]) => {
            const count = events.filter(e => e.type === key).length;
            Object.entries(eventTypes).map(([key, type]: [string, { icon: any; label: strig; color: string }]) => { 
const count = events.filter(e => e.type === key). length;
const IconComponent = type.icon;
            return (
              <button key={key}>
              <IconComponent size={16} />
                {type.label} ({count})
              </button>
            );
          });
        </div>

        {/* Lista evenimente */}
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nu ai evenimente adăugate încă.</p>
              <p className="text-sm">Apasă pe "Adaugă eveniment" pentru a începe.</p>
            </div>
          ) : (
            sortedEvents.map(event => {
              const IconComponent = eventTypes[event.type].icon;
              const daysUntil = getDaysUntilEvent(event);
              const statusColor = getStatusColor(daysUntil);
              const displayDate = event.finalDate || event.date;
              
              return (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-${eventTypes[event.type].color}-100`}>
                        <IconComponent size={20} className={`text-${eventTypes[event.type].color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{event.title}</h3>
                        <p className="text-sm text-gray-600">{eventTypes[event.type].label}</p>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{formatDate(displayDate)}</p>
                        {event.useExpirationDate && (
                          <p className="text-xs text-gray-500">
                            Expiră: {formatDate(event.expirationDate)}
                          </p>
                        )}
                        <p className={`text-sm font-medium ${statusColor}`}>
                          {daysUntil < 0 ? `Expirat (${Math.abs(daysUntil)} zile)` :
                           daysUntil === 0 ? 'Astăzi!' :
                           `${daysUntil} zile rămase`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editEvent(event)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Formularul de adăugare/editare */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingEvent ? 'Editează eveniment' : 'Adaugă eveniment nou'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip eveniment
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(eventTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titlu
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Ex: Asigurare RCA Dacia Logan"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data eveniment
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useExpirationDate"
                  checked={newEvent.useExpirationDate}
                  onChange={(e) => setNewEvent({...newEvent, useExpirationDate: e.target.checked})}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="useExpirationDate" className="text-sm font-medium text-gray-700">
                  Doresc să setez o dată de expirare diferită
                </label>
              </div>

              {newEvent.useExpirationDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de expirare
                  </label>
                  <input
                    type="date"
                    value={newEvent.expirationDate}
                    onChange={(e) => setNewEvent({...newEvent, expirationDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Notificările se vor calcula în funcție de data de expirare
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descriere (opțional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Detalii suplimentare..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notificare cu câte zile înainte
                </label>
                <select
                  value={newEvent.notifyDays}
                  onChange={(e) => setNewEvent({...newEvent, notifyDays: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 zi</option>
                  <option value={3}>3 zile</option>
                  <option value={7}>7 zile</option>
                  <option value={14}>14 zile</option>
                  <option value={30}>30 zile</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={editingEvent ? updateEvent : addEvent}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingEvent ? 'Actualizează' : 'Adaugă'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formularul pentru tipuri de evenimente personalizate */}
      {showCustomEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Creează tip eveniment nou
              </h2>
              <button
                onClick={() => setShowCustomEventForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume eveniment
                </label>
                <input
                  type="text"
                  value={newCustomEventType.label}
                  onChange={(e) => setNewCustomEventType({...newCustomEventType, label: e.target.value, key: e.target.value})}
                  placeholder="Ex: Schimb ulei motor"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Iconița
                </label>
                <select
                  value={newCustomEventType.icon}
                  onChange={(e) => setNewCustomEventType({...newCustomEventType, icon: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.keys(iconOptions).map(icon => (
                    <option key={icon} value={icon}>
                      {icon === 'AlertCircle' ? 'Alertă' :
                       icon === 'Car' ? 'Mașină' :
                       icon === 'Heart' ? 'Inimă' :
                       icon === 'CreditCard' ? 'Card' :
                       icon === 'Gauge' ? 'Contor' :
                       icon === 'Users' ? 'Persoane' :
                       icon === 'Calendar' ? 'Calendar' :
                       icon === 'Bell' ? 'Clopoțel' : icon}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Culoare
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCustomEventType({...newCustomEventType, color})}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCustomEventType.color === color ? 'border-gray-800' : 'border-gray-300'
                      } bg-${color}-500 hover:scale-110 transition-transform`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addCustomEventType}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Creează tip eveniment
                </button>
                <button
                  onClick={() => setShowCustomEventForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceTracker;