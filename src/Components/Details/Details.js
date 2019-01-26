import React, { Component } from 'react';
import "./Details.css";
import Button from '@material-ui/core/Button';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import CircularProgress from '@material-ui/core/CircularProgress';
import { addItemInCart } from "../../Redux/Actions"
import Api from "../../Api"
import Item from "../Item/Item";
import { connect } from "react-redux";
import TextField from '@material-ui/core/TextField';

var Remarkable = require('remarkable');


class ConnectedDetails extends Component {

    state = {
        relatedItems: [],
        quantity: "1",
        item: null,
        unfinishedTasks: 0,
    }

    async fetchProductUsingID(id) {

        this.setState((ps) => ({ unfinishedTasks: ps.unfinishedTasks + 1 }))

        // First, let's get the item, details of which we want to show. 
        let item = await Api.getItemUsingID(id);

        // Now, we can get related items too. 
        let relatedItems = await Api.searchItems({ category: item.category });

        this.setState((ps) => {
            return {
                item,
                unfinishedTasks: ps.unfinishedTasks - 1,
                relatedItems: relatedItems.data.filter((x, i) => x.id !== item.id && i < 10)
            }
        })


    }

    componentWillReceiveProps(nextProps) {
        this.fetchProductUsingID(parseInt(nextProps.match.params.id, 10));
    }

    componentDidMount() {
        this.fetchProductUsingID(parseInt(this.props.match.params.id, 10));
    }

    // Some product information contains markup, we use Remarkable for this.
    getRawMarkup(data) {
        const md = new Remarkable();
        return { __html: md.render(data) };
    }

    render() {

        if (this.state.unfinishedTasks !== 0 || !this.state.item) {
            return (<CircularProgress className="circular" />)
        }


        return (
            <div className="details-page">

                <div style={{ color: "#504F5A", fontSize: 20, marginRight: 15, lineHeight: "50px", height: 50, borderRadius: "5px" }}>
                    {this.state.item.name}
                </div>
                <div className="details-page-content">
                    <div style={{ margin: 5, width: 290, height: 290, padding: 2, border: "1px solid lightgray", borderRadius: 5 }}>
                        <img alt={this.state.item.name} style={{ objectFit: "contain", height: "100%", width: "100%" }} src={this.state.item.imageURL} />
                    </div>
                    <div style={{ flex: 1, marginLeft: 30, display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: 18, marginTop: 10 }}>Price: {this.state.item.price} $</div>
                        {this.state.item.popular && <span style={{ color: "#1a9349", fontWeight: "bold", marginTop: 5, fontSize: 14 }}>(Popular product)</span>}

                        <TextField type="number"
                            value={this.state.quantity}
                            style={{ marginTop: 20, marginBottom: 20, width: 50 }}
                            label="Quantity"
                            onChange={(e) => {
                                let val = parseInt(e.target.value);
                                if (val < 1 || val > 10) return;
                                this.setState({ quantity: val.toString() })
                            }}></TextField>
                        <Button style={{ width: 200, marginTop: 20 }} color="primary" variant="contained"
                            onClick={() => {
                                this.props.dispatch(addItemInCart({ ...this.state.item, quantity: parseInt(this.state.quantity) }));
                            }}>
                            Add to Cart  <AddShoppingCartIcon style={{ marginLeft: 5 }} />
                        </Button>

                    </div>
                </div>

                <div style={{ color: "#504F5A", fontSize: 20, marginRight: 15, lineHeight: "50px", height: 50, borderRadius: "5px" }}>
                    Description
                 </div>

                <div style={{ color: "gray", marginTop: 5, marginLeft: 5, maxHeight: 200, fontSize: 13, overflow: "auto" }} dangerouslySetInnerHTML={this.state.item.description ? this.getRawMarkup(this.state.item.description) : { __html: "Not available" }}></div>


                <div style={{ color: "#504F5A", marginTop: 10, fontSize: 20, marginRight: 15, lineHeight: "50px", height: 50, borderRadius: "5px" }}>
                    Related Items
                 </div>

                <div style={{
                    overflow: "auto",
                    whiteSpace: "nowrap",
                    marginTop: 5,
                    width: "100%",
                }} cols={3}>
                    {this.state.relatedItems.length === 0 ? <span style={{ fontSize: 13, color: "gray", marginLeft: 10 }}>Not available</span> :
                        this.state.relatedItems.map(item => (
                            <span key={item.id} style={{ marginLeft: 50, marginRight: 50 }}>
                                <Item item={item} />
                            </span>
                        ))}
                </div>

            </div >


        );
    }
}

let Details = connect()(ConnectedDetails);
export default Details;
