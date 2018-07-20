import React from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import request from 'superagent';
import Chart from 'chart.js'
import merge from 'lodash/merge'
import Correlation from 'node-correlation'

let practice = []

const data = {
  labels: [],
  datasets: [
    {
      label: 'BTC',
      lineTension: 0.5,
      backgroundColor: 'rgba(75,192,192,0.2)',
      borderColor: 'rgba(75,192,192,1)',
      borderWidth: 4,
      pointRadius: 1,
      pointBorderWidth: 1,
      pointHoverBorderWidth: 3,
      pointHitRadius: 5,
      yAxisID: 'A',
      data: []
    }, {
      label: 'Data Two',
      lineTension: 0.5,
      backgroundColor: 'rgba(181, 61, 103, 0.2)',
      borderColor: 'rgba(181, 61, 103, 1)',
      borderWidth: 4,
      pointRadius: 1,
      pointBorderWidth: 1,
      pointHoverBorderWidth: 3,
      pointHitRadius: 5,
      yAxisID: 'B',
      data: []
    }

  ]
};

//list of possible tokens to search from
const allCoins = [
  'BTC', 'ETH', 'XRP', 'BCH', 'LTC', 'ADA', 'XLM', 'NEO', 'EOS', 'XMR',
  'DASH', 'NEM', 'LSK', 'ETC', 'QTUM', 'OMG', 'ZEC', 'STEEM',
  'BCN', 'PPT', 'STRAT', 'XVG', 'SC', 'DOGE', 'WAVES', 'SNT', 'BTS',
  'WTC', 'ZRX', 'REP', 'AE', 'VERI', 'DCR', 'HSR', 'KMD', 'ARDR', 'ZCL',
  'ARK', 'DGD', 'GAS', 'BAT', 'LRC', 'KNC', 'BTM', 'PIVX', 'GNT','SYS',
  'PLR', 'FCT', 'LINK', 'PAY', 'BNT', 'PART', 'REQ', 'MAID', 'XZC',
  'KIN', 'ENG', 'NXT', 'SALT', 'FUN', 'CND', 'AION', 'SAN',
  'QSP', 'VTC', 'ICN', 'GNO', 'SUB', 'CVC', 'ZEN', 'NXS', 'ANT',
  'TNT', 'AMB', 'MLN', 'SNGLS', 'MTL', 'SNM', 'AST', 'MOD', 'QRL',
  'RPX', 'VEE', 'NAV', 'MANA', 'EMC', 'DNT', 'ION', 'COSS', 'ONION',
  'GRS', 'TAAS', 'DCT', 'VIBE', 'HST', 'LUN', 'UNO', 'EVX', 'DLT',
  'BCC', 'SHIFT', 'MTH', 'NMR', 'DNA', 'AIR', 'STX', 'XRL', 'CSNO'
  ]

const options = {
      title: {
        display: true,
        text: 'DIVERSIFY!',
        fontSize: 35,
        fontFamily: 'Helvetica',
        fontStyle: 300,
        fontColor: 'black'
      },
      layout: {
        padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
        }
      },
      scales: {
        yAxes: [{
          id: 'A',
          type: 'linear',
          position: 'left',
          gridLines: {
            color: 'black',
            display: false
          },
          ticks: {
            fontColor: 'black'
          }
        }, {
          id: 'B',
          type: 'linear',
          position: 'right',
          ticks: {
            fontColor: 'black'
          },
          gridLines: {
            color: 'black',
            display: false
          },
        }],
        xAxes: [{
          ticks: {
            fontColor: 'black'
          },
          gridLines: {
            color: 'black',
            display: false
          },
        }]
      },
      legend: {
        labels: {
          fontColor: 'black'
        }
      }
}

class Graph extends React.Component {
   constructor(props) {
     super(props)
     this.state = { Data: [] , Symbol: '', Coins: [], Lowest : 1, Winner: '', tempData: [] }
     this.data = []
   }

   labelArray() {
     let arr = []
     for(let i = 60; i > -1; i--) {
       if(i % 10 !== 0) {
         arr.push('')
       } else {
         arr.push(i)
       }
     }
     return arr
   }

   componentWillMount() {
     //initially start the page to show a chart of bitcoin
     let url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + 'BTC' + '&tsym=USD&limit=60&aggregate=3&e=CCCAGG'
     let that = this
     request.get(url, (err, res) => {
       if (err) throw err;

       that.state.Data = res.body.Data

       that.setState({ Data: that.state.Data });
     });
   }

   update(field) {
     return(e) => {
       this.setState({[field]: e.target.value})
     }
   }

   componentWillReceiveProps(newProps) {
     this.setState(newProps.Symbol)

   }


   handleSubmit(e) {
     this.setState({ Lowest: 1.5 , Winner: ''} )
     e.preventDefault()

     //make api call using the inputted coin symbol
     let url = `https://min-api.cryptocompare.com/data/histoday?fsym=${this.state.Symbol}&tsym=USD&limit=60&aggregate=3&e=CCCAGG`
     let that = this
     request.get(url, (err, res) => {
       if (err) throw err;
       that.state.Data = res.body.Data
       that.setState({ Data: that.state.Data });
     });

     let testArr = []
     let inputArr = []
     let best = 1.5
     for(let i = 0; i < allCoins.length; i++) {

       url = 'https://min-api.cryptocompare.com/data/histoday?fsym=' + allCoins[i] + '&tsym=USD&limit=60&aggregate=3&e=CCCAGG'
       let that = this

       request.get(url, (err, res) => {
         if (err) throw err;
         that.state.Coins = res.body.Data
         testArr = []
         inputArr = []
         for(let j = 0; j < res.body.Data.length; j++) {
           if(that.state.Data[j]) {
             inputArr.push(that.state.Data[j].close)
             testArr.push(res.body.Data[j].close)
           }
         }

         //calculate correlation between the inputted coin and every other
         let temp = Correlation.calc(testArr, inputArr);
         if(parseFloat(temp) < parseFloat(that.state.Lowest)) {
           that.setState({ Winner: allCoins[i] , Lowest: temp, tempData: testArr })

         }

       })


     }

   }

  render() {



    if(this.state.Data.length > 1) {
      let l = this.state.Data.length
      let dArray = []
      for(let i = 0; i < this.state.Data.length; i++) {
          dArray.push(this.state.Data[i].close)
      }
      data.datasets[0].data = dArray
      data.datasets[1].data = this.state.tempData
    }
    data.labels = this.labelArray()

    if(this.state.Winner) {
      data.datasets[0].label = this.state.Symbol
    } else {
      data.datasets[0].label = 'BTC'
    }
    data.datasets[1].label = this.state.Winner



    return (
      <div className="chart">
        <Line data={data} options={options} />


        <form className="coin-form" onSubmit={e => this.handleSubmit(e)} >
          <label className="input-box">
            <input
              type="text"
              className="coin-input"
              value={this.state.Symbol}
              onChange={this.update('Symbol')}
              placeholder="Coin symbol" />
          </label>
          <input type="submit" className="search-coin" value="Search" />
        </form>

        <h3 className="newcone">Suggestion: {this.state.Winner}</h3>



      </div >
    )
  }
}

export default Graph;


