import './custom.css';
import route from '../assets/route.png';
import timeleft from '../assets/timeleft.png';

import { useState, useEffect, useMemo } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

import { submitRoute } from '../api/api';

function GameView({ game, segments, stations, lines, endGame }) {
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [submitted, setSubmitted] = useState(false);

  // timer countdown
  useEffect(() => {
    if (!game || submitted || timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [game, timeLeft, submitted]);

  // submit when timer =0
  useEffect(() => {
    if (game && timeLeft <= 0 && !submitted) {
      handleSubmit();
    }
  }, [timeLeft]);

  if (!game) return null; // to not render anything if no game is active

  // used segments
  const usedKeys = new Set(selectedSegments.map(s =>
    Math.min(s.station1_id, s.station2_id) + '-' + Math.max(s.station1_id, s.station2_id) //normalized
  ));

  // random order during the game
  const shuffledSegments = useMemo(() => {
    return [...segments].sort(() => 0.5 - Math.random());
  }, [segments]);

  // available segments = all segments - used segments
  const available = shuffledSegments.filter(seg => {
    const normKey = Math.min(seg.station1_id, seg.station2_id) + '-' + Math.max(seg.station1_id, seg.station2_id);
    return !usedKeys.has(normKey); // false = already used, true = available
  });

  // add segment to the route, with correct orientation
  const addSegment = (seg) => {
    let s1 = seg.station1_id; 
    let s2 = seg.station2_id;
    let n1 = seg.station1_name; 
    let n2 = seg.station2_name;

    // compare by station ids
    // if it is in the opposite direction, reverse it
    if (selectedSegments.length === 0) {
      if (game.startStation.id === seg.station2_id) { 
        s1 = seg.station2_id; 
        s2 = seg.station1_id;
        n1 = seg.station2_name; 
        n2 = seg.station1_name;
      }
    } else {
      const lastEnd = selectedSegments[selectedSegments.length - 1].station2_id;
      if (lastEnd === seg.station2_id) { // if it is in the opposite direction, reverse it
        s1 = seg.station2_id; 
        s2 = seg.station1_id;
        n1 = seg.station2_name; 
        n2 = seg.station1_name;
      }
    }

    setSelectedSegments(prev => [...prev, {
      line_id: seg.line_id, station1_id: s1, station2_id: s2,
      station1_name: n1, station2_name: n2, line_name: seg.line_name
    }]);
  };

  const undoLast = () => {
    setSelectedSegments(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    const routeData = selectedSegments.map(s => ({
      line_id: s.line_id,
      station1_id: s.station1_id,
      station2_id: s.station2_id
    }));

    try {
      const result = await submitRoute(game.gameId, routeData);
      endGame(result);
    } catch {
      endGame({ valid: false, score: 0, steps: [] });
    }
  };

  return (
    <Container>
      <div className='game-panel mb-3'>
        <Row className='align-items-center'>
          {/* route  */}
          <Col sm="2">
            <img src={route} alt="Route" className='game-title-img' />
            <p className='game-mission'>
              <strong>{game.startStation.name} </strong> → <strong>{game.endStation.name}</strong>
            </p>
          </Col>
          {/* map  */}
          <Col sm="8" className='text-center'>
            <img src="src/assets/metromap_empty.png" alt="Metro Map" className='game-map' />
          </Col>
          {/* timer  */}
          <Col sm="2" className='text-center'>
            <img src={timeleft} alt="Time Left" className='game-title-img' />
            <h2 className={timeLeft <= 10 ? 'game-timer-danger' : 'game-timer'}>{timeLeft}s</h2>
          </Col>
        </Row>
      </div>

      <Row>
        <Col sm="7">
        {/* segments  */}
          <div className='game-panel'>
            <h5 className='game-panel-heading'>Available Segments</h5>
            {available.map((seg, i) => (
              <Row key={i} className='game-segment-row'
                onClick={() => !submitted && addSegment(seg)}>
                <Col>{seg.station1_name} ↔ {seg.station2_name}</Col>
              </Row>
            ))}
            {available.length === 0 && <p className='game-muted'>All segments used</p>}
          </div>
        </Col>
        {/* my route  */}
        <Col sm="5">
          <div className='game-panel'>
            <h5>My Route ({selectedSegments.length} segments) </h5>
            {selectedSegments.length === 0 && <p className='game-muted'>No segments selected yet</p>}
            {selectedSegments.map((seg, i) => (
              <Row key={i} className='game-route-row'>
                <Col>{i + 1}. {seg.station1_name} → {seg.station2_name}</Col>
              </Row>
            ))}
          </div>
        </Col>
      </Row>

      <div className='text-center mt-3'>
        {selectedSegments.length > 0 && (
          <Button className='me-2 btn-outline-dark' onClick={undoLast} disabled={submitted}>
            Undo Last
          </Button>
        )}
        <Button className='btn-gold' onClick={handleSubmit} disabled={submitted}>
          Submit Route
        </Button>
      </div>
    </Container>
  );
}

export default GameView;