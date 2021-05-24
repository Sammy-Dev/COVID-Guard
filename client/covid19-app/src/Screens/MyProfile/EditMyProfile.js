

import { Form, Input, Button} from 'antd';
import { layout2 } from '../Register/Helpers/Layouts';
import { useAuth,useAuthUpdate } from '../../Components/AuthContext/AuthContext';
import { _editProfileGeneral, _getGeneralProfile } from '../../_helpers/endPoints';
import { useState, useEffect } from 'react';
import { logout } from '../../_helpers/sharedFunctions';
import { theTailLayout } from './MyProfileLayout';
import { useForm } from 'antd/lib/form/Form';
import history from '../../_helpers/history';
import PATH from '../../_constants/paths';


const data = {
    password: "***************",
}

 const EditMyProfile = () => {
    const auth = useAuth();
    const updateAuth = useAuthUpdate();
    const [form] = useForm();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({});

    useEffect(() =>{
        let unmounted = false;

        Promise.all([_getGeneralProfile(auth.token)])
        .then( resArr=> {
            if(!unmounted){
                const userRes = resArr[0];
                setUserData(userRes.data);
                form.setFieldsValue({firstName: userRes.data.firstName, lastName: userRes.data.lastName, email: userRes.data.email, phone: userRes.data.phone   });
            }
        })
        .catch( err => {
            console.log(err);
            if(err.response.status === 401) logout(updateAuth, auth.token, auth.type);
        });

        return () => { unmounted = true };
    }, [auth.token, updateAuth, auth.type, form]);

    const updateInfo = values => {
        setLoading(true);
        
        _editProfileGeneral(auth.token, values)
        .then(() => {
            setLoading(false);
            history.push(PATH.myProfile);
        })
        .catch(err => {
            console.log(err);
            if(err.response.status === 401) logout(updateAuth, auth.token, auth.type);
            setLoading(false);
        });
    }

    return (
        <div style = {{textAlign: "center", color: "#0E5F76"}}>

            <h1 style = {{color: "#0E5F76", textAlign: "left", backgroundColor: "#FDC500", paddingLeft: "1%"}}>My Profile</h1>
            <div style={{textAlign: 'center', padding: '1%'}}>
                <h1 style={{color: "#0E5F76"}}> Edit Profile Details </h1>
            </div>
            
            <Form 
                {...layout2}
                onFinish={updateInfo}
                form = {form}
                  >
                <Form.Item
                    label="First Name"
                    name="firstName"
                    style={{color: "#0E5F76"}}                    
                >
                    <Input maxLength={30}/>
                </Form.Item>
        
                <Form.Item
                    label="Last Name"
                    name="lastName"
                    style={{color: "#0E5F76"}}
                    rules={[{whitespace: true}]}
                >
                    <Input  maxLength={30} />
                </Form.Item> 

                <Form.Item 
                    label="Phone" 
                    name="phone" 
                    style={{color: "#0E5F76"}}
                    rules={[{whitespace: true}]}
                    >
                    <Input  />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    style={{color: "#0E5F76"}}
                    validateTrigger={['onBlur']}
                    rules={[{type: 'email', message: 'Please input a valid email!', whitespace: true}]}
                >
                    <Input placeholder= {userData.email} disabled maxLength={30} />
                </Form.Item>   

                <Form.Item
                    label="Password"
                    name="password"
                    style={{color: "#0E5F76"}}
                    rules={[{whitespace: true}]}
                >
                    <Input  placeholder= {data.password} disabled/>
                </Form.Item>
    
                <div style={{textAlign: 'center'}}>
                    <Button loading={loading} type="primary" htmlType="submit"  >Save Changes</Button> &nbsp;&nbsp;
                    <Button  onClick={() => {history.push(PATH.myProfile)}} type="primary" >Discard Changes</Button>
                </div> <br/>

                <Form.Item {...theTailLayout}>
                    <span onClick={() => {history.push(PATH.changePassword)}} style={{color: "#0E5F76"}}><u style={{cursor: "pointer"}} >Change Password</u></span>
                </Form.Item>

            </Form>
            
        </div>
    );
}

export default EditMyProfile;