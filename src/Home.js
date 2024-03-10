import React, {useState, useEffect, useRef, useMemo} from 'react';
import { Amplify } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';

import { get, post } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { DataGrid } from "@mui/x-data-grid";

const Div = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
}));

Amplify.configure(awsconfig);

const columns = [
  {
    field: "name",
    headerName: "Product",
    flex: 4
  },
  {
    field: "pricePerQuantity",
    headerName: "Price Per Quantity (£)",
    type: "number",
    width: 160,
    flex: 4
  },
  {
    field: "quantity",
    headerName: "Choose Quantity",
    type: "number",
    width: 160,
    flex: 4,
    editable: true
  }
];

function useApiRef() {
  const apiRef = useRef(null);
  const _columns = useMemo(
    () =>
      columns.concat({
        field: "",
        width: 0,
        renderCell: (params) => {
          apiRef.current = params.api;
          return null;
        }
      }),
    []
  );

  return { apiRef, columns: _columns };
}

function buildSummary(orderSummary, products) {
  console.log(orderSummary);
  const summary = "Total payable: £" + orderSummary.reduce((n, {price}) => n + price, 0) + " for " +
    orderSummary.map(
      item => item.quantity + " " + products.find(el => el.productId === item.productId).name + (item.quantity > 1 ? "s" : "")).join(", ")
  return summary;
}
 
export function Home() {
  const { signOut, user } = useAuthenticator();

  const [productList, setProductList] = useState([]);

  const [orderSummary, setOrderSummary] = useState([]);

  const { apiRef, columns } = useApiRef();
  
  const handleClickButton = async () => {
    const uniqueId = () => parseInt(Date.now() * Math.random(), 10)
    const rowDetails = Array.from(apiRef.current.getRowModels().values()).filter(function (el) {return el.quantity > 0;})
    const orderId = uniqueId();
    const userId = await currentAuthenticatedUser();
    const orderDetails = rowDetails.map(obj => ({ 
      "orderId": orderId,
      "userId": userId,
      "productId": obj.productId,
      "quantity" : obj.quantity,
      "price": obj.quantity * obj.pricePerQuantity
    }));
    
    const orderProgress = [];
    for (const product of orderDetails) {
      const orderStatus = await placeOrder(product);
      console.log(orderStatus);
      if (orderStatus){
        orderProgress.push(
          {
            productId: product.productId,
            price: product.price,
            quantity: product.quantity
          }
        );
      }
    }
    setOrderSummary(orderProgress);
  }

  function handleClearButton(){
    setOrderSummary([]);
    setProductList(productList.map(obj => ({ ...obj, quantity: 0 })));
  }

  async function getProducts() {
    try {
      const restOperation = get({ 
        apiName: 'products',
        path: '/products' 
      });
      
      const { body } = await restOperation.response;
      const json = await body.json();
      return setProductList(json.map(obj => ({ ...obj, quantity: 0 })))
    } catch (e) {
      console.log('GET call failed: ', JSON.parse(e.response.body));
    }
  }

  async function currentAuthenticatedUser() {
    try {
      const user = await getCurrentUser();
      return user.userId; 
    } catch (err) {
      console.log(err);
    }
  }

  async function placeOrder(orderDetails) {
    try {
      const restOperation = post({
        apiName: 'order',
        path: '/create',
        options: {
          body: orderDetails
        }
      });
  
      const { body } = await restOperation.response;
      const response = await body.json();
      return true;
    } catch (e) {
      console.log('POST call failed: ', JSON.parse(e.response.body));
      return false;
    }
  }

  useEffect(() => {
    getProducts();
  }, [])

  if (!productList){
    return
  }

  return (    
    <Box className="datatable" sx={{ height: 363 }}>
      <Div>
        <Typography variant="subtitle1">Hello!</Typography>
        <Typography variant="subtitle2">Please choose quantities to place an order.</Typography>
      </Div>
      <DataGrid
        rows={productList}
        getRowId={(row) => row.productId}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick={true}
        sx={{ m: 2, width: "100%" }}
        autoHeight={true}
        hideFooter={true}
      />
      <Stack spacing={2} direction="row" sx={{ p: 2 }}>
        <Button variant="contained" onClick={handleClickButton}>Place order</Button>
        <Button variant="contained" onClick={handleClearButton}>Clear order</Button>
        <Button variant="text" onClick={signOut}>Sign out</Button>
      </Stack>
      
      <Divider />

      <Stack spacing={2} direction="row" sx={{ p: 2 }}>
      { orderSummary.length > 0 &&  <Chip
        label={ buildSummary(orderSummary, productList) }
        onDelete={handleClearButton}
      />}
      </Stack>
    </Box>
    
  );
}