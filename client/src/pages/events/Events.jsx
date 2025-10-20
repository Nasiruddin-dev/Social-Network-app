import "./events.scss";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import moment from "moment";

const Events = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    eventTime: ""
  });

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
  queryFn: () => axiosInstance.get("/events").then((res) => res.data)
  });

  // Create event mutation
  const createEventMutation = useMutation(
  (newEvent) => axiosInstance.post("/events", newEvent),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
        setShowCreateModal(false);
        setEventData({ title: "", description: "", location: "", eventDate: "", eventTime: "" });
      },
    }
  );

  // RSVP mutation
  const rsvpMutation = useMutation(
  ({ eventId, status }) => axiosInstance.post(`/events/${eventId}/rsvp`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
      },
    }
  );

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (eventData.title.trim() && eventData.eventDate) {
      const eventDateTime = `${eventData.eventDate} ${eventData.eventTime || '00:00'}`;
      createEventMutation.mutate({ ...eventData, eventDate: eventDateTime });
    }
  };

  const handleRSVP = (eventId, status) => {
    rsvpMutation.mutate({ eventId, status });
  };

  const handleInputChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // Separate events into upcoming and past
  const now = moment();
  const upcomingEvents = events.filter(event => moment(event.eventDate).isAfter(now));
  const pastEvents = events.filter(event => moment(event.eventDate).isBefore(now));

  if (isLoading) return <div className="events">Loading...</div>;

  return (
    <div className="events">
      <div className="container">
        <div className="header">
          <div>
            <h1>Events</h1>
            <p className="subtitle">Discover and create events</p>
          </div>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
            <AddIcon /> Create Event
          </button>
        </div>

        {/* Upcoming Events */}
        <div className="events-section">
          <h2>Upcoming Events ({upcomingEvents.length})</h2>
          {upcomingEvents.length === 0 ? (
            <div className="no-events">
              <p>No upcoming events. Create one to get started!</p>
            </div>
          ) : (
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-date-badge">
                    <div className="month">{moment(event.eventDate).format('MMM')}</div>
                    <div className="day">{moment(event.eventDate).format('DD')}</div>
                  </div>
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <div className="event-details">
                      <div className="detail">
                        <CalendarTodayIcon fontSize="small" />
                        <span>{moment(event.eventDate).format('MMMM DD, YYYY')}</span>
                      </div>
                      {event.eventTime && (
                        <div className="detail">
                          <AccessTimeIcon fontSize="small" />
                          <span>{moment(event.eventDate).format('hh:mm A')}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="detail">
                          <LocationOnIcon fontSize="small" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="event-footer">
                      <div className="creator">
                        <img
                          src={event.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect fill='%23ddd' width='30' height='30'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3E%3F%3C/text%3E%3C/svg%3E"}
                          alt={event.name}
                        />
                        <span>by {event.name}</span>
                      </div>
                      <div className="rsvp-section">
                        <span className="attendees">{event.attendees || 0} going</span>
                        {event.userRSVP === 'going' ? (
                          <button className="rsvp-btn going">Going</button>
                        ) : (
                          <button
                            className="rsvp-btn"
                            onClick={() => handleRSVP(event.id, 'going')}
                            disabled={rsvpMutation.isLoading}
                          >
                            Interested
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="events-section past">
            <h2>Past Events ({pastEvents.length})</h2>
            <div className="events-grid">
              {pastEvents.map((event) => (
                <div key={event.id} className="event-card past-event">
                  <div className="event-date-badge">
                    <div className="month">{moment(event.eventDate).format('MMM')}</div>
                    <div className="day">{moment(event.eventDate).format('DD')}</div>
                  </div>
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <div className="event-details">
                      <div className="detail">
                        <CalendarTodayIcon fontSize="small" />
                        <span>{moment(event.eventDate).format('MMMM DD, YYYY')}</span>
                      </div>
                      {event.location && (
                        <div className="detail">
                          <LocationOnIcon fontSize="small" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="event-footer">
                      <span className="past-label">Event Ended</span>
                      <span className="attendees">{event.attendees || 0} attended</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Event</h2>
              <CloseIcon onClick={() => setShowCreateModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter event title"
                  value={eventData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="What's this event about?"
                  value={eventData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={eventData.eventDate}
                    onChange={handleInputChange}
                    min={moment().format('YYYY-MM-DD')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="eventTime"
                    value={eventData.eventTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Where will it happen?"
                  value={eventData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={createEventMutation.isLoading}>
                  {createEventMutation.isLoading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
