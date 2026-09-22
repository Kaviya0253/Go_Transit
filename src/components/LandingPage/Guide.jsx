import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBus, faClock, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import '../../styles/Guide.css';
import GuideVideo from '../../assets/go-transit-demo.mp4';

function Guide() {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    const togglePlay = () => {
        const video = videoRef.current;
        if (video.paused) video.play();
        else video.pause();
    };

    return (
        <div className='guide-container' id='how-it-works'>
            <h2 className='Guide-heading'>
                Know Before You Go <br />
                <span className='highlight'>Track Your Bus Live</span>
            </h2>
            <div className="guide-content">
                <div className='guide-video'>
                    <video ref={videoRef} preload='metadata' disablePictureInPicture disableRemotePlayback controlsList='nodownload nofullscreen noremoteplayback'key={GuideVideo} src={GuideVideo} type='video/mp4' onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}></video>
                    <button className='video-toggle' onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Play video'}>
                        <FontAwesomeIcon icon={playing ? faPause : faPlay} />
                    </button>
                </div>
                <div className="guide-text">
                    <h3>Steps</h3>
                    <p><FontAwesomeIcon icon={faMapMarkerAlt} size="2x" className='fa' /> <span><em className='step-no'>Step 1</em>Enter your start and end locations to find available buses.</span></p>
                    <p><FontAwesomeIcon icon={faBus} size="2x" className='fa'/> <span><em className='step-no'>Step 2</em>Select a bus from the list.</span></p>
                    <p><FontAwesomeIcon icon={faClock} size="2x" className='fa'/> <span><em className='step-no'>Step 3</em>Tap any bus stop to see the ETA.</span></p>
                    {/* <p><FontAwesomeIcon icon={faChair} size="2x" className='fa'/> <span>Check seat availability for the bus.</span></p> */}
                </div>
            </div>
        </div>
    );
}

export default Guide;