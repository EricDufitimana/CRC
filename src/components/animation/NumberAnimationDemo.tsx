"use client";
import React from "react";
import { 
  AnimatedNumber, 
  AnimatedCounter, 
  AnimatedPercentage, 
  AnimatedCurrency, 
  AnimatedPlusNumber,
  formatters
} from "./AnimatedNumber";

/**
 * Demo component showcasing different number animation styles
 * This component demonstrates various ways to use the AnimatedNumber component
 */
export const NumberAnimationDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">GSAP Number Animations Demo</h2>
      
      {/* Basic Counter */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Basic Counters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              <AnimatedCounter value={1250} duration={2} />
            </div>
            <p className="text-sm text-gray-600">Students</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              <AnimatedPlusNumber value={95} duration={2.5} />
            </div>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              <AnimatedPercentage value={87.5} decimals={1} duration={3} />
            </div>
            <p className="text-sm text-gray-600">Satisfaction</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              <AnimatedCurrency value={45000} duration={2.8} />
            </div>
            <p className="text-sm text-gray-600">Average Salary</p>
          </div>
        </div>
      </div>

      {/* Different Easing Effects */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Different Easing Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600">
              <AnimatedNumber value={999} ease="bounce.out" duration={3} />
            </div>
            <p className="text-sm text-gray-600">Bounce Effect</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              <AnimatedNumber value={888} ease="elastic.out(1, 0.3)" duration={3} />
            </div>
            <p className="text-sm text-gray-600">Elastic Effect</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">
              <AnimatedNumber value={777} ease="back.out(1.7)" duration={3} />
            </div>
            <p className="text-sm text-gray-600">Back Effect</p>
          </div>
        </div>
      </div>

      {/* Custom Formatters */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Custom Formatters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">
              <AnimatedNumber 
                value={1500000} 
                formatter={formatters.largeNumber}
                duration={2.5}
              />
            </div>
            <p className="text-sm text-gray-600">Large Number (M/K)</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600">
              <AnimatedNumber 
                value={123456} 
                formatter={formatters.withCommas}
                duration={2.5}
              />
            </div>
            <p className="text-sm text-gray-600">With Commas</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-600">
              <AnimatedNumber 
                value={3661} 
                formatter={formatters.timeFormat}
                duration={2.5}
              />
            </div>
            <p className="text-sm text-gray-600">Time Format</p>
          </div>
        </div>
      </div>

      {/* Staggered Animations */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Staggered Animations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 150, label: "Projects", delay: 0 },
            { value: 89, label: "Clients", delay: 0.3 },
            { value: 1200, label: "Hours", delay: 0.6 },
            { value: 95, label: "Rating", delay: 0.9 }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                <AnimatedNumber 
                  value={item.value} 
                  delay={item.delay}
                  duration={2}
                  ease="power2.out"
                  suffix={index === 3 ? "%" : ""}
                />
              </div>
              <p className="text-sm text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Style Updates */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Dashboard Style Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="text-2xl font-bold">
              <AnimatedNumber value={2847} duration={2.5} className="text-white" />
            </div>
            <p className="text-blue-100 text-sm">Total Users</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="text-2xl font-bold">
              <AnimatedPercentage value={94.2} decimals={1} duration={2.5} className="text-white" />
            </div>
            <p className="text-green-100 text-sm">Completion Rate</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="text-2xl font-bold">
              <AnimatedCurrency value={15420} duration={2.5} className="text-white" />
            </div>
            <p className="text-purple-100 text-sm">Revenue</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <div className="text-2xl font-bold">
              <AnimatedNumber 
                value={4.8} 
                decimals={1} 
                suffix="★" 
                duration={2.5} 
                className="text-white" 
              />
            </div>
            <p className="text-orange-100 text-sm">Rating</p>
          </div>
        </div>
      </div>

      {/* Restart on Scroll Demo */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Restart on Scroll Demo</h3>
        <p className="text-gray-600 mb-4">
          Scroll past these numbers, then scroll back up to see them restart their animation!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              <AnimatedNumber 
                value={1337} 
                duration={2.5}
                ease="bounce.out"
                restartOnScroll={true}
                triggerStart="top 85%"
              />
            </div>
            <p className="text-sm text-gray-600">Restarts on Scroll</p>
            <p className="text-xs text-gray-500 mt-1">Bounces every time</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">
              <AnimatedNumber 
                value={5678} 
                duration={3}
                ease="elastic.out(1, 0.3)"
                restartOnScroll={true}
                triggerStart="top 85%"
              />
            </div>
            <p className="text-sm text-gray-600">Restarts on Scroll</p>
            <p className="text-xs text-gray-500 mt-1">Elastic animation</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              <AnimatedNumber 
                value={9999} 
                duration={2}
                ease="back.out(1.7)"
                restartOnScroll={true}
                triggerStart="top 85%"
              />
            </div>
            <p className="text-sm text-gray-600">Restarts on Scroll</p>
            <p className="text-xs text-gray-500 mt-1">Back ease animation</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Compare: Animation Only Once</h4>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              <AnimatedNumber 
                value={4242} 
                duration={2.5}
                ease="power2.out"
                restartOnScroll={false}
                triggerStart="top 85%"
              />
            </div>
            <p className="text-sm text-gray-600">Only animates once (restartOnScroll=false)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberAnimationDemo;
