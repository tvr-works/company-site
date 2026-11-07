const services = [
  { id: 'create', title: <>Create<br className="desktop-break" /> something new</>, description: 'Ideas → applications & solutions' },
  { id: 'modernize', title: <>Modernize<br className="desktop-break" /> what exists</>, description: 'Rebuild, integrate, improve' },
  { id: 'ai', title: 'Put AI to work', description: 'Insight, action & automation' },
  { id: 'direction', title: <>Get technical<br className="desktop-break" /> direction</>, description: 'Fractional leadership & advice' },
];

export function Partnership() {
  return <section className="partnership page-width" aria-labelledby="partnership-heading">
    <img className="partnership-art" src="/assets/partnership.svg" width="1300" height="640" alt="" aria-hidden="true" />
    <h2 id="partnership-heading" className="partnership-hub">One direct<br /> partnership</h2>
    <ul className="service-list">
      {services.map(service => <li key={service.id} className={`service service-${service.id}`}>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
      </li>)}
    </ul>
  </section>;
}
