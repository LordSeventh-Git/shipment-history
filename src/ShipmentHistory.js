import { useEffect, useState } from "react";
import "./ShipmentHistory.css";
import axios from "./axios";

function ShipmentHistory() {
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    axios
      .get("/data.json")
      .then((res) => setHistoryList(res.data.shipmentHistory))
      .catch((err) => alert(err.message));
  }, []);

  const getDateValues = (timestamp) => {
    const date = new Date(timestamp);
    return [date.getFullYear(), date.getMonth(), date.getDate()];
  };

  let initialDate = new Date(...getDateValues(historyList[0]?.eventDateTime));

  const mustDisplayDate = (index) => {
    let displayDate = true;
    let currentDate = new Date(
      ...getDateValues(historyList[index].eventDateTime)
    );
    if (initialDate.getTime() === currentDate.getTime()) {
      displayDate = false;
    } else {
      initialDate = currentDate;
    }
    return displayDate;
  };

  const getShipmentError = (index) => {
    return historyList[index]?.shipment?.status?.shipmentIsDelayed
      ? historyList[index]?.shipment?.status?.shipmentIsDelayed
      : historyList[index]?.shipmentIsDelayed
      ? historyList[index]?.shipmentIsDelayed
      : historyList[index]?.shipment?.status?.ShipmentException
      ? historyList[index]?.shipment?.status?.ShipmentException
      : false;
  };

  return (
    <div className="container shipmentHistory">
      <div className="row">
        <div className="col-12 shipmentHistory__title">Shipment History</div>
      </div>
      {historyList?.map((historyItem, index) => {
        const isLast = historyList.length - 1 === index;
        let displayDate = index > 0 ? mustDisplayDate(index) : true;

        return (
          <ShipmentHistoryItem
            key={index}
            eventDateTime={historyItem.eventDateTime}
            eventPosition={historyItem.eventPosition}
            isLast={isLast}
            displayDate={displayDate}
            shipmentIsDelayed={getShipmentError(index)}
            willBeDelayed={getShipmentError(index + 1)}
          />
        );
      })}
    </div>
  );
}

export default ShipmentHistory;

function ShipmentHistoryItem({
  eventDateTime,
  eventPosition,
  isLast,
  displayDate,
  shipmentIsDelayed,
  willBeDelayed,
}) {
  function get_nth_suffix(date) {
    switch (date) {
      case 1:
      case 21:
      case 31:
        return date + "st";
      case 2:
      case 22:
        return date + "nd";
      case 3:
      case 23:
        return date + "rd";
      default:
        return date + "th";
    }
  }

  const getFormattedDate = (timestamp) => {
    let formattedDate = Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
    }).format(new Date(timestamp));
    formattedDate = formattedDate.split(" ");
    let formattedDay = get_nth_suffix(Number(formattedDate[1]));
    return `${formattedDate[0]} ${formattedDay}`;
  };
  const getFormattedTime = (timestamp) => {
    return Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
    })
      .format(new Date(timestamp))
      .toLowerCase()
      .replace(/\s+/g, "");
  };
  const color = shipmentIsDelayed ? "#f6a800" : "#428bca";
  const place =
    eventPosition?.city && eventPosition?.state
      ? `${eventPosition?.city}, ${eventPosition?.state}`
      : "";

  let status = eventPosition?.status;
  status = status === "ARRIVED" || status === "DELIVERED" ? status : null;

  return (
    <div className="row shipmentHistory__item">
      <div className="col-5 row shipmentHistory__timeline">
        <div className="col-12 col-md-6">
          <p className="shipmentHistory__date">
            {displayDate && getFormattedDate(eventDateTime)}
          </p>
        </div>
        <div className="col-12 col-md-6">
          <p className="shipmentHistory__detail">
            {getFormattedTime(eventDateTime)}
          </p>
        </div>
      </div>
      <div className="col-1 d-flex flex-column align-items-center">
        <div className="shipmentHistory__icon">
          {status ? (
            <clr-icon
              shape={status === "DELIVERED" ? "check-circle" : "map-marker"}
              size="36"
              style={{ color }}
            ></clr-icon>
          ) : (
            <div id="dot" style={{ background: color }}></div>
          )}
        </div>
        {!isLast && (
          <div
            id="timeliner"
            style={{
              background: willBeDelayed ? "#f6a800" : color,
            }}
          ></div>
        )}
      </div>
      <div className="col-6 row shipmentHistory__info">
        <div className="col-12 col-md-9">
          <p className="shipmentHistory__status">{eventPosition?.status}</p>
          <p className="shipmentHistory__detail">{eventPosition?.comments}</p>
        </div>
        <div className="col-12 col-md-3">
          <p className="shipmentHistory__detail">{place}</p>
        </div>
      </div>
    </div>
  );
}
