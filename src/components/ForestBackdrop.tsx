import React from 'react'

/** Decorative layers for the member dashboard, built from local editorial imagery. */
const ForestBackdrop: React.FC = () => (
  <div className="forest-backdrop" aria-hidden="true">
    <div className="forest-backdrop__canopy" />
    <div className="forest-backdrop__light" />
    <div className="forest-backdrop__mist forest-backdrop__mist--one" />
    <div className="forest-backdrop__mist forest-backdrop__mist--two" />
    <img className="forest-backdrop__leaf forest-backdrop__leaf--left" src="/images/editorial/aloe-texture.jpg" alt="" />
    <img className="forest-backdrop__leaf forest-backdrop__leaf--right" src="/images/editorial/dew-leaf.jpg" alt="" />
    <img className="forest-backdrop__leaf forest-backdrop__leaf--base" src="/images/editorial/aloe-texture.jpg" alt="" />
    <div className="forest-backdrop__shade" />
  </div>
)

export default ForestBackdrop
