import { useState, useEffect, useContext } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router';

import { getRanking } from '../api/api';

import UserContext from '../contexts/UserContext';

function RankingView() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);

  const user = useContext(UserContext);
  if (!user.id) return <Navigate to='/' />;

  useEffect(() => {
    getRanking()
      .then(r => setRanking(r))
      .catch(() => setRanking([]));
  }, []);

  return (
    <Container>
      <h3 className='text-center mb-3'>Ranking</h3>
      <Row className='ranking-header'>
        <Col sm="2">#</Col>
        <Col sm="6">Player</Col>
        <Col sm="4">Best Score</Col>
      </Row>
      {ranking.map((r, i) => (
        <Row key={i} className='ranking-row'>
          <Col sm="2">{i + 1}</Col>
          <Col sm="6">{r.name}</Col>
          <Col sm="4">{r.best_score} coins</Col>
        </Row>
      ))}
      {ranking.length === 0 && (
        <Row><Col className='text-center text-muted'>No games played yet</Col></Row>
      )}
      <div className='text-center mt-3'>
        <Button onClick={() => navigate('/home')} className='btn-gold'>
          Back to Game
        </Button>
      </div>
    </Container>
  );
}

export default RankingView;
