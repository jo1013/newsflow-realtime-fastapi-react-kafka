
import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Snackbar, IconButton } from '@mui/material';
import { toggleNewsSubscription, fetchNewsSourcesApi } from '../api/subscribedNewsApi';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

function SubscriptionList() {
    const [newsList, setNewsList] = useState([]);
    const [subscribedNews, setSubscribedNews] = useState(new Map());
    const [pendingSubscriptions, setPendingSubscriptions] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleSnackbarClose = (reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const loadNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const sources = await fetchNewsSourcesApi();
            console.log('Fetched sources:', sources);
            
            if (!sources) {
                throw new Error('Invalid data received from server');
            }

            const sourcesMap = new Map(sources.map(source => [source.source, false]));
            console.log('Sources Map:', sourcesMap);

            setNewsList(sources);
            setSubscribedNews(sourcesMap);
        } catch (error) {
            console.error('뉴스 데이터 로딩 실패:', error);
            setError(`Failed to load news: ${error.message}. Click to retry.`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscriptionToggle = (source) => {
        setPendingSubscriptions(prevPending => {
            const newPending = new Map(prevPending);
            const currentStatus = subscribedNews.get(source);
            const newStatus = currentStatus ? 'unsubscribe' : 'subscribe';
            
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
    
        await Promise.all(Array.from(pendingSubscriptions.entries()).map(async ([source, action]) => {
            try {
                await toggleNewsSubscription(source, action);
                setSubscribedNews(prev => new Map(prev).set(source, action === 'subscribe'));
            } catch (error) {
                console.error(`Subscription toggle failed for ${source}:`, error);
                feedbackMessages.push(`Failed to process request for source ${source}. Error: ${error.message}`);
            }
        }));
    
        setPendingSubscriptions(new Map());
    
        if (feedbackMessages.length === 0) {
            setSnackbarMessage('All changes have been successfully applied!');
            setSnackbarOpen(true);
            setTimeout(() => navigate('/news'), 2000);
        } else {
            setSnackbarMessage(feedbackMessages.join("\n"));
            setSnackbarOpen(true);
        }
    };
    useEffect(() => {
        loadNews();
    }, []);

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h6">{error}</Typography>
                <Button variant="contained" onClick={loadNews}>Retry</Button>
            </Container>
        );
    }



    const getBackgroundColor = (source) => {
        if (pendingSubscriptions.has(source)) {
            return pendingSubscriptions.get(source) === 'subscribe' ? '#add8e6' : 'white';
        }
        return subscribedNews.has(source) && subscribedNews.get(source) ? '#add8e6' : 'white';
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
                        {newsList.map(news => {
                            const backgroundColor = getBackgroundColor(news.source);
                            console.log(`News Source: ${news.source}, Background Color: ${backgroundColor}`);

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={news.source}>
                                    <Card
                                        onClick={() => handleSubscriptionToggle(news.source)}
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
                                                {news.source}
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


