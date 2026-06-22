import { useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import './custom.css';

function ResultView({ result }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // if no result do not render anything
  if (!result) return null;

  if (!result.valid) {
    return (
      <Container className='mt-3 text-center'>
        <div className='game-panel' style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className='result-invalid'>Invalid route!</h2>
          <p className='result-invalid'>Score: 0 coins</p>
          <Button className='me-2 btn-gold' onClick={() => navigate('/home')}>Go Home</Button>
          <Button className='btn-outline-gold' onClick={() => navigate('/ranking')}>View Ranking</Button>
        </div>
      </Container>
    );
  }
  
  const step = result.steps[currentStep];
  const isLast = currentStep >= result.steps.length;

  if (isLast) {
    return (
      <Container className='mt-3 text-center'>
        <div className='game-panel' style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className='game-mission'>Final Score: {result.score} coins</h2>
        <Button className='me-2 btn-gold' onClick={() => navigate('/home')}>Go Home</Button>
        <Button className='btn-outline-gold' onClick={() => navigate('/ranking')}>View Ranking</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className='mt-3'>
      <div className='game-panel mb-3 text-center'>
        <Row className='game-route-row'>
          <Col sm="5">{step.station1_name} → {step.station2_name}</Col>
          <Col sm="7" className='text-end'><strong>{step.coins} coins</strong></Col>
        </Row>
        <img src={`src/assets/events/event_${step.event.id}.png`} className='result-event-img' />
        <p className='game-muted mt-2'>Event {currentStep + 1} of {result.steps.length} </p>
        <Button className='btn-gold mt-2' onClick={() => setCurrentStep(s => s + 1)}>
        {currentStep < result.steps.length - 1 ? 'Next Event' : 'See Final Score'}
        </Button>
      </div>
    </Container>
  );
}

export default ResultView;