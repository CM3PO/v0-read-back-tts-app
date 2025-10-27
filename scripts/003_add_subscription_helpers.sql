-- Helper function to upgrade a user to premium
CREATE OR REPLACE FUNCTION upgrade_to_premium(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET 
    plan_type = 'premium',
    status = 'active',
    start_date = NOW(),
    end_date = NOW() + INTERVAL '1 month'
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to cancel premium subscription
CREATE OR REPLACE FUNCTION cancel_premium(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET 
    plan_type = 'free',
    status = 'active',
    end_date = NULL
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION upgrade_to_premium(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_premium(UUID) TO authenticated;
