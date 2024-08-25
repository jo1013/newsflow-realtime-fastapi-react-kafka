import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Snackbar, IconButton } from '@mui/material';
import { toggleNewsSubscriptionApi, fetchNewsSourcesApi, fetchSubscribedNewsApi } from '../api/subscribedNewsApi';
import CloseIcon from '@mui/icons-material/Close';

function SubscriptionList() {
    const [newsSources, setNewsSources] = useState([]);
    const [subscribedSources, setSubscribedSources] = useState(new Set());
    const [pendingSubscriptions, setPendingSubscriptions] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

        
    // SubscriptionList.js의 loadNews 함수 수정
    const loadNews = async () => {
        setLoading(true);
        setError(null);
        try {
        const sources = await fetchNewsSourcesApi();
        console.log('Fetched sources:', sources);
        
        if (!sources) {
            throw new Error('Invalid data received from server');
        }
        
        setNewsSources(sources);
        
        try {
            const subscribed = await fetchSubscribedNewsApi();
            console.log('Subscribed sources:', subscribed);
            setSubscribedSources(new Set(subscribed.map(sub => sub.news_source_id)));
        } catch (subError) {
            console.error('Failed to fetch subscribed sources:', subError);
            // 구독 정보를 가져오는 데 실패해도 뉴스 소스는 표시합니다.
        }
        } catch (error) {
        console.error('뉴스 데이터 로딩 실패:', error);
        setError(`Failed to load news: ${error.message}. Click to retry.`);
        } finally {
        setLoading(false);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };


    const handleSubscriptionToggle = (source) => {
        setPendingSubscriptions(prevPending => {
            const newPending = new Map(prevPending);
            const currentStatus = subscribedSources.has(source);
            const newStatus = currentStatus ? 'unsubscribed' : 'subscribed';
            
            console.log(`Toggling subscription for Source: ${source}, Current Status: ${currentStatus}, New Status: ${newStatus}`);

            if (newPending.has(source)) {
                newPending.delete(source);
            } else {
                newPending.set(source, newStatus);
            }
            
            return newPending;
        });
    };


    const applyChanges = async () => {
        const feedbackMessages = [];
      
        for (const [source, action] of pendingSubscriptions.entries()) {
          try {
            await toggleNewsSubscriptionApi(source, action);
            setSubscribedSources(prev => {
                const newSet = new Set(prev);
                if (action === 'subscribed') {
                    newSet.add(source);
                } else {
                    newSet.delete(source);
                }
                return newSet;
            });
          } catch (error) {
            console.error(`Subscription toggle failed for ${source}:`, error);
            feedbackMessages.push(`Failed to process request for source ${source}. ${error.message}`);
          }
        }
      
        setPendingSubscriptions(new Map());
      
        if (feedbackMessages.length === 0) {
          setSnackbarMessage('All changes have been successfully applied!');
          setSnackbarOpen(true);
          loadNews();  
        } else {
          setSnackbarMessage(feedbackMessages.join("\n"));
          setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const getBackgroundColor = (source) => {
        if (pendingSubscriptions.has(source)) {
            return pendingSubscriptions.get(source) === 'subscribed' ? '#add8e6' : 'white';
        }
        return subscribedSources.has(source) ? '#add8e6' : 'white';
    };
    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
            All News Sources
        </Typography>
        {loading ? (
            <Typography variant="h6" align="center">Loading...</Typography>
        ) : (
            <>
                <Grid container spacing={4}>
                    {newsSources.map((newsSource, index) => {
                        const backgroundColor = getBackgroundColor(newsSource.source);
                        console.log(`News Source: ${newsSource.source}, Background Color: ${backgroundColor}`);

                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={`${newsSource.source}-${index}`}>
                                <Card
                                    onClick={() => handleSubscriptionToggle(newsSource.source)}
                                    sx={{
                                        opacity: 1,
                                        backgroundColor,
                                        cursor: 'pointer',
                                        border: '1px solid #dcdcdc',
                                        transition: 'background-color 0.3s'
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" component="p">
                                            {newsSource.source}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 4 }}
                    onClick={applyChanges}
                    disabled={pendingSubscriptions.size === 0}
                >
                    Apply Changes
                </Button>
            </>
        )}
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
            action={
                <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleSnackbarClose}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            }
        />
    </Container>
);
}

export default SubscriptionList;