import { useState, useEffect } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import { getRanking } from '../api/api';

function RankingView() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    getRanking()
      .then(r => setRanking(r))
      .catch(() => setRanking([]));
  }, []);

  return (
    <Container>
      <h3 className='text-center mb-3'>Ranking</h3>
      <Row style={{ fontWeight: 'bold', borderBottom: '2px solid #c9a84c', paddingBottom: '5px', marginBottom: '5px' }}>
        <Col sm="2">#</Col>
        <Col sm="6">Player</Col>
        <Col sm="4">Best Score</Col>
      </Row>
      {ranking.map((r, i) => (
        <Row key={i} style={{ padding: '5px 0' }}>
          <Col sm="2">{i + 1}</Col>
          <Col sm="6">{r.name}</Col>
          <Col sm="4">{r.best_score} coins</Col>
        </Row>
      ))}
      {ranking.length === 0 && (
        <Row><Col className='text-center text-muted'>No games played yet</Col></Row>
      )}
      <div className='text-center mt-3'>
        <Button onClick={() => navigate('/home')} style={{ backgroundColor: '#c9a84c', border: 'none', color: '#1a1a0e', fontFamily: 'serif', letterSpacing: '1px' }}>
          Back to Game
        </Button>
      </div>
    </Container>
  );
}

export default RankingView;
